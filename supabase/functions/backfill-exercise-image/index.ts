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

while (true){

  const {data, error} = await supabase.from("exercise")
  .select("external_id")
  .range(from, from + pageSize - 1)

  const exerciseExternalIds  = data.map(exercise => exercise.external_id)

  if (!exerciseExternalIds || exerciseExternalIds.length === 0) break;


 try {


  for (let i = 0; i<exerciseExternalIds.length; i++) {
    exerciseIds.push(exerciseExternalIds[i])
  }

  from += pageSize
  continue;


  
 } catch (error) {
  console.log(error)
  
 }
}

 return new Response(
  JSON.stringify(exerciseIds.length),
{headers: {"Content-Type": "application/json"}}
)

//TODO: currently this only returns 1000 rows this is because of the maximum that supabase allows - we need to build in some pagination logic to allow us to navigate through the different pages

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
