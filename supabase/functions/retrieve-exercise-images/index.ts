// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"

console.log("Hello from Functions!")
import {createClient} from "jsr:@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("REMOTE_SUPABASE_URL"),
  Deno.env.get("REMOTE_SUPABASE_SERVICE_ROLE_KEY")

)

Deno.serve(async (req) => {
  // const exerciseName = req.json()

  const exerciseName = "0001.gif"

  const {data: exerciseImage} = await supabase.storage
  .from("exercise-images")
  .getPublicUrl(exerciseName)

  return new Response(
    JSON.stringify(exerciseImage),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/retrieve-exercise-images' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
