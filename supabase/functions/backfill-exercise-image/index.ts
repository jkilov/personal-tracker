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
const pageSize = 1000
let exercisesTest = []



try {


const {data: exerciseData, error: exerciseTableError} = await supabase
.from("exercise")
.select("*")



exercisesTest = exerciseData

console.log("ex ", exercisesTest.length)



if (exerciseTableError) throw new Error("Cannot retrieve exercise table")


while (true){


 const {data, error} = await supabase.from("exercise")
 .select("external_id")
 .range(from, from + pageSize - 1)


 if(error) throw error

 if (!data|| data.length === 0) break;

 const exerciseExternalIds  = data.map(exercise => exercise.external_id)

for (let i=0; i<exerciseExternalIds.length; i++) {
  const imageUrl =  `https://exercisedb.p.rapidapi.com/image?exerciseId=${exerciseExternalIds[i]}&resolution=180`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": Deno.env.get("RAPID_API_KEY"),
      "x-rapidapi-host": Deno.env.get("RAPID_API_KEY"),
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

 
    const {data} = supabase.storage.from("exercise-images"
      .getPublicUrl(fileName)
    )

    const publicUrl = data.publicUrl

//TODO: we now need to retrieve the data from our exercie table, map over it and add the new media url to it and then push this back into our exercise table via supabase
//need MAP



    //end of loop
  }


//TODO: need to come back to this below
 from += pageSize

 continue;

} // end of while loop


 } catch (error) {
 console.error("failed to fetch external_ids", error)

 return new Response(JSON>stringify("unknown error"))

}


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




