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




Deno.serve(async (req) => {
const exerciseIds = []
let from = 0
const pageSize = 10
let exercisesTableArr = []


//TODO: i need to create batching where it uploads a batch of 50 at a time?



try {
while (true){

const {data: exerciseData, error: exerciseTableError} = await supabase
.from("exercise")
.select("*")
.range(from, pageSize-1)




exercisesTableArr.push(exerciseData)

//TODO: need to add in mapping with the exercise table to add the media_url_ref into exercise table
//TODO: is there a better way for this to run in a background and not be interrupted like it currently is when i click awy or into another table. How do i have this run without someone clicking a link to run it

if (exerciseTableError) throw new Error("Cannot retrieve exercise table")


 const {data, error} = await supabase.from("exercise")
 .select("external_id")
 .range(from, from + pageSize - 1)


console.log("dd: ", data)



 exerciseData.map(exercise => exercise.external_id === data.external_id ? exercise.media_url_ref = data.external_id : null )



 if(error) throw error

 if (!data|| data.length === 0) break;

 const exerciseExternalIds  = data.map(exercise => exercise.external_id)




for (let i=0; i<exerciseExternalIds.length; i++) {

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


    const {error: uploadError} = await supabase.storage
    .from("exercise-images")
    .upload(fileName, gifImage, {
      contentType: "image/gif",
      upsert: false
    })


 
//     const {data} = supabase.storage.from("exercise-images")
//     .getPublicUrl(fileName)
    

//     const publicUrl = data.publicUrl

//     console.log(publicUrl)

  }



//  from += pageSize

//  continue;

} // end of while loop


 } catch (error) {
 console.error("failed to fetch external_ids", error)

 return new Response(JSON.stringify("unknown error"))

}

const {error} = await supabase
.from("exercise")
.insert(exerciseExternalIds)

console.log("err", error)

//TODO: check the above would work - if supabase will accept Arr of objects


return new Response(
 JSON.stringify(exerciseIds.length),
{headers: {"Content-Type": "application/json"}}
)




//   return new Response(
//     JSON.stringify(data),
//     { headers: { "Content-Type": "application/json" } },
//   )
})


/* To invoke locally:


 1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
 2. Make an HTTP request:


 curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/backfill-exercise-image' \
   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
   --header 'Content-Type: application/json' \
   --data '{"name":"Functions"}'


*/




