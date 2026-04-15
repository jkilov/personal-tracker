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


const runSleeper = async() =>  new Promise((resolve) => {
  setTimeout(()=>{
    console.log("waiting new batch")
    resolve()}, 
    3000)
})

Deno.serve(async (req) => {
let processed = 0
let totalRows = 0

while (true) {
  //TODO: add sleeper function for batching

try {


const {data: exerciseData, error: exerciseTableError, count} = await supabase
.from("exercise")
.select("*", {count: "exact"})
.is("media_url_ref", null)
.limit(10) // 10 selected to avoid timeouts

totalRows = count


if (exerciseTableError) throw new Error( "Cannot retrieve exercise table")

  if (!exerciseData || exerciseData.length === 0) return new Response(
    JSON.stringify({message: "Batch completed, no more exercises to process", processed, remaining: totalRows - processed}),
   {headers: {"Content-Type": "application/json"}}
   )


for (let i = 0; i< exerciseData.length; i++) {

  const imageUrl =  `https://exercisedb.p.rapidapi.com/image?exerciseId=${exerciseData[i].external_id}&resolution=180`;
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

    const fileName = `${exerciseData[i].external_id}.gif`


    const {data: fileUpload, error: uploadError} = await supabase.storage
    .from("exercise-images")
    .upload(fileName, gifImage, {
      contentType: "image/gif",
      upsert: true
    })

    //TODO: handle if file exists to skip and then set above upsert to false

    if(uploadError) throw new Error("Upload failure")

      if (fileUpload.path) {



      const {error: updateExerciseTableError} = await supabase.from('exercise')
      .update({media_url_ref: `${fileName}`})
      .eq('exercise_id', exerciseData[i].exercise_id)
    
  
if (updateExerciseTableError){ throw new Error("error uploading media_url_ref to exercise table")
}

    ++processed
    console.log( `processed: ${processed}, remaining: ${totalRows - processed})`,
  )


    
      }
  }


await runSleeper()

 } catch (error) {
 console.error("failed to fetch external_ids", error)

 return new Response(JSON.stringify({message: "error received: " + error.message, processed, remaining: totalRows - processed},
  
 ), {status: 500,
  headers: {"Content-Type": "application/json"}
})

}
}


return new Response(
 JSON.stringify({processed: processed, remaining: totalRows - processed}),
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




