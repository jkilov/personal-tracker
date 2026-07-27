// Setup type definitions for built-in Supabase Runtime APIs
import {createClient} from  "jsr:@supabase/supabase-js@2"
import "@supabase/functions-js/edge-runtime.d.ts"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
)

const BATCH_SIZE = 10 // small batches to stay well inside the edge-function time limit

// This is an operator job, not a user endpoint: it makes billed RapidAPI calls
// and writes with the service role. verify_jwt alone is satisfied by the public
// anon key, so require the service-role key itself as the bearer token.
const isOperatorRequest = (req: Request) => {
  const authHeader = req.headers.get("Authorization") ?? ""
  const token = authHeader.replace(/^bearer /i, "")
  return token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
}

// Processes ONE batch per invocation and reports progress; the driver script
// (src/scripts/storeImageExercises.js) re-invokes until the backfill completes.
Deno.serve(async (req) => {

  if (!isOperatorRequest(req)) {
    return new Response(
      JSON.stringify({message: "Unauthorized"}),
      {status: 401, headers: {"Content-Type": "application/json"}}
    )
  }

  let processed = 0

  try {

    const {data: exerciseData, error: exerciseTableError, count} = await supabase
      .from("exercise")
      .select("*", {count: "exact"})
      .is("media_url_ref", null)
      .limit(BATCH_SIZE)

    if (exerciseTableError) throw new Error("Cannot retrieve exercise table")

    const totalRemaining = count ?? 0

    if (!exerciseData || exerciseData.length === 0) {
      return new Response(
        JSON.stringify({message: "Batch completed, no more exercises to process", processed, remaining: 0}),
        {headers: {"Content-Type": "application/json"}}
      )
    }

    for (const exercise of exerciseData) {

      const imageUrl = `https://exercisedb.p.rapidapi.com/image?exerciseId=${exercise.external_id}&resolution=180`
      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key": Deno.env.get("RAPID_API_KEY") ?? "",
          "x-rapidapi-host": Deno.env.get("RAPID_API_HOST") ?? "",
        }
      }

      const imageResponse = await fetch(imageUrl, options)

      if (!imageResponse.ok) throw new Error("Image fetch failed")

      const gifImage = await imageResponse.blob()
      const fileName = `${exercise.external_id}.gif`

      const {data: fileUpload, error: uploadError} = await supabase.storage
        .from("exercise-images")
        .upload(fileName, gifImage, {
          contentType: "image/gif",
          upsert: true
        })

      if (uploadError) throw new Error("Upload failure")

      if (fileUpload.path) {
        const {error: updateExerciseTableError} = await supabase.from("exercise")
          .update({media_url_ref: `${fileName}`})
          .eq("exercise_id", exercise.exercise_id)

        if (updateExerciseTableError) {
          throw new Error("error uploading media_url_ref to exercise table")
        }

        ++processed
        console.log(`processed: ${processed}, remaining: ${totalRemaining - processed}`)
      }
    }

    return new Response(
      JSON.stringify({message: "Batch processed", processed, remaining: totalRemaining - processed}),
      {headers: {"Content-Type": "application/json"}}
    )

  } catch (error) {
    // Log full detail server-side; never return internals to the client.
    console.error("backfill batch failed", error)
    return new Response(
      JSON.stringify({message: "Internal server error", processed}),
      {status: 500, headers: {"Content-Type": "application/json"}}
    )
  }
})


/* To invoke locally:


 1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
 2. Make an HTTP request (the Authorization bearer must be the service-role key):


 curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/backfill-exercise-image' \
   --header 'Authorization: Bearer <service-role-key>' \
   --header 'Content-Type: application/json'


*/
