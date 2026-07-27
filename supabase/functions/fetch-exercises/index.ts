// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import {createClient} from  "jsr:@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
)


const rowCleanUp = (str: string) => {
  const toLowerCase = str.toLowerCase()

  const words = toLowerCase.split(/\s+/)

    const capitalisedWords = words.map(word => { 
      if (word.length === 0) return "";
    return word.charAt(0).toUpperCase() + word.slice(1)
    })
    return capitalisedWords.join(" ")
}
  


// This is an operator job, not a user endpoint: it makes billed RapidAPI calls
// and writes with the service role. verify_jwt alone is satisfied by the public
// anon key, so require the service-role key itself as the bearer token.
const isOperatorRequest = (req: Request) => {
  const authHeader = req.headers.get("Authorization") ?? ""
  const token = authHeader.replace(/^bearer /i, "")
  return token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
}

Deno.serve(async (req) => {

  if (!isOperatorRequest(req)) {
    return new Response(
      JSON.stringify({message: "Unauthorized"}),
      {status: 401, headers: {"Content-Type": "application/json"}}
    )
  }

  const url ="https://exercisedb.p.rapidapi.com/exercises?limit=0"
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": Deno.env.get("RAPID_API_KEY") ?? "",
      "x-rapidapi-host": Deno.env.get("RAPID_API_HOST") ?? "",
    }
  }


  try {

    const request = await fetch(url, options)

    if (!request.ok) {
      throw new Error(`ExerciseDB request failed with status ${request.status}`)
    }

    const exerciseData = await request.json()

    if (!Array.isArray(exerciseData)) {
      throw new Error("ExerciseDB returned an unexpected response shape")
    }

    const totalFromApi = exerciseData.length

    const {count: existingCount, error: countError} = await supabase
    .from("exercise")
    .select("*", {count: "exact", head: true})

    if (countError) {
      throw countError
    }


    if ((existingCount ?? 0) >= totalFromApi) {
      return new Response(JSON.stringify({message: " Exercise already seeded. Import skipped", inserted: 0, existingCount}),
      {headers: {"Content-Type": "application/json"}}
      )
    }

   

    
    
const rows = exerciseData.map(exercise => ({
  external_id: exercise.id,
  exercise_name: rowCleanUp(exercise.name),
  body_part: rowCleanUp(exercise.bodyPart),
  equipment: rowCleanUp(exercise.equipment),
  source: "exercisedb",

}))

    const {error, count} = await supabase
    .from("exercise")
    .upsert(rows, { count: "exact"})

    if (error) {
      throw error
    }
    
      return new Response(
        JSON.stringify({success: true, inserted: count}),
        { headers: { "Content-Type": "application/json" } },
      )
    

    
  } catch (error) {
    // Log full detail server-side; never return internals to the client.
    console.error(error)
    return new Response (
      JSON.stringify({message: "Internal server error"}),
      {status: 500,
      headers: { "Content-Type": "application/json" } },
    )
  }
})
  

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/fetch-exercises' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
