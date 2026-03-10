// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import {createClient} from  "jsr:@supabase/supabase-js@2"

console.log("Hello from Functions!")


const supabase = createClient(
  Deno.env.get("REMOTE_SUPABASE_URL")!,
  Deno.env.get("REMOTE_SUPABASE_SERVICE_ROLE_KEY")!,
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
  


Deno.serve(async (req) => {

//TODO: update rapiddb subscription to get full list of exercises
//download all images and store these witihn supabase
//link exercise table to storage to get exercises


  const url ="https://exercisedb.p.rapidapi.com/exercises?limit=0"
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": Deno.env.get("RAPID_API_KEY"),
      "x-rapidapi-host": Deno.env.get("RAPID_API_HOST"),
    }
  }


  try {

    const {count: existingCount, error: countError} = await supabase
    .from("exercise")
    .select("*", {count: "exact", head: true})

    if (countError) {
      throw countError
    }

    if((existingCount ?? 0) > 0) {
      return new Response(JSON.stringify({message: " Exercise already seeded. Import skipped", inserted: 0, existingCount}),
    {headers: {"Content-Type": "application/json"}}
    )
    }

    const request = await fetch(url, options)
    const exerciseData = await request.json()

    
    
const apiKey = Deno.env.get("RAPID_API_KEY")

const rows = exerciseData.map(exercise => ({
  external_id: exercise.id,
  exercise_name: rowCleanUp(exercise.name),
  body_part: rowCleanUp(exercise.bodyPart),
  media_url: `https://exercisedb.p.rapidapi.com/image?exerciseId=${exercise.id}&resolution=180`,
  equipment: rowCleanUp(exercise.equipment),
  source: "exercisedb"
}))

    const {data, error, count} = await supabase
    .from("exercise")
    .insert(rows, {ignoreDuplicates: true, count: "exact"})

    if (error) {
      throw error
    }
    
      return new Response(
        JSON.stringify({success: true, inserted: count}),
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
