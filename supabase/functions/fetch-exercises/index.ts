// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import {createClient} from  "jsr:@supabase/supabase-js@2"

console.log("Hello from Functions!")


const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
)

Deno.serve(async (req) => {



  const url ="https://exercisedb.p.rapidapi.com/exercises"
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": Deno.env.get("RAPID_API_KEY"),
      "x-rapidapi-host": Deno.env.get("RAPID_API_HOST"),
    }
  }


  try {


    const request = await fetch(url, options)
    const exerciseData = await request.json()
      
    
    const rows = exerciseData.map(exercise => ({exercise_id: exercise.id, exercise_name: exercise.name, body_part: exercise.bodyPart, media_url: "", equipment: exercise.equipment }))


    const {data, error} = await supabase
    .from("exercise")
    .insert(rows)

    if (error) {
      throw error
    }
    
      return new Response(
        JSON.stringify({message: data}),
        { headers: { "Content-Type": "application/json" } },
      )
    

    
  } catch (error) {
    return new Response (
      JSON.stringify({message: error.message}), 
      { headers: { "Content-Type": "application/json" } },
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
