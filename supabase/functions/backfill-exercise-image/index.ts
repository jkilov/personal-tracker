// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.


// Setup type definitions for built-in Supabase Runtime APIs
import {createClient} from  "jsr:@supabase/supabase-js@2"
import "@supabase/functions-js/edge-runtime.d.ts"


console.log("Hello from Functions!")




const supabase = createClient(
 Deno.env.get("REMOTE_SUPABASE_URL")!,
 Deno.env.get("REMOTE_SUPABASE_SERVICE_ROLE_KEY")!,
)


let totalProcessed = 0
let from = 0
let totalRowCount = 0
const remaining = totalRowCount - totalProcessed
const processedId = new Set()




Deno.serve(async (req) => {
const pageSize = 10
let processed = 0
let skipped = 0







//TODO: need to add a check to see if the media_url_ref is null or not - if not, skip


try {

  

const {data: exerciseData, error: exerciseTableError, count} = await supabase
.from("exercise")
.select("*", {count: "exact"})
.range(from, pageSize-1)

totalRowCount = count //total count of rows in table = 1324

if (exerciseTableError) throw new Error("Cannot retrieve exercise table")

  if (!exerciseData || exerciseData.length === 0) throw new Error("no exercises could be found")


 const exerciseExternalIds  = exerciseData.map(exercise => exercise.external_id)

// const exerciseExternalIds = exerciseData.map(exercise => exercise.includes(!exercise.media_url_ref) ? exercise.external_id : null)

for (let i=0; i<exerciseExternalIds.length; i++) { //loop start

  if(exerciseExternalIds[i].media_url_ref) {
    ++skipped
    continue;
  }

  const imageUrl =  `https://exercisedb.p.rapidapi.com/image?exerciseId=${exerciseExternalIds[i]}&resolution=180`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": Deno.env.get("RAPID_API_KEY"),
      "x-rapidapi-host": Deno.env.get("RAPID_API_HOST"),
    }
  }

  const imageResponse = await fetch(imageUrl,options)


  if (!imageResponse.ok) throw new Error("Image fetch failed")

    const gifImage = await imageResponse.blob()

    const fileName = `${exerciseExternalIds[i]}.gif`


    const {data: fileUpload, error: uploadError} = await supabase.storage
    .from("exercise-images")
    .upload(fileName, gifImage, {
      contentType: "image/gif",
      upsert: false
    })

    if(uploadError) throw new Error("Upload failure")

      if (fileUpload.path) {

      processedId.add(exerciseExternalIds[i])

  

    const remainingGifs = totalRowCount - processed

    ++processed

    totalProcessed = processed
    
    if (processed === totalRowCount) break

      }
  }
  from += pageSize
  const upsertExerciseDataTable = exerciseData.map(exercise => processedId.has(exercise.external_id) ? {...exercise, media_url_ref: `${exercise.external_id}.gif`} : exercise)


  const {error} = await supabase.from('exercise')
  .upsert(upsertExerciseDataTable)

  if (error) throw error


 } catch (error) {
 console.error("failed to fetch external_ids", error)

 return new Response(JSON.stringify("unknown error"))

}




return new Response(
 JSON.stringify("completed, total processed: ", totalProcessed + "remaining" + remaining + "skipped: " + skipped),
{headers: {"Content-Type": "application/json"}}
)

})


/* To invoke locally:


 1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
 2. Make an HTTP request:


 curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/backfill-exercise-image' \
   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
   --header 'Content-Type: application/json' \
   --data '{"name":"Functions"}'


*/




