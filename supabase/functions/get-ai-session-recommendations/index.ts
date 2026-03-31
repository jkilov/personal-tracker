// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import {createClient} from "jsr:@supabase/supabase-js@2"

console.log("Hello from Functions!")

const supabase = createClient(
  Deno.env.get("REMOTE_SUPABASE_URL"),
Deno.env.get("REMOTE_SUPABASE_SERVICE_ROLE_KEY")
);

Deno.serve(async (req) => {
 

  // const {sessionId} = req.json()

  const sessionId = "75dac6f6-d3b5-40ef-b788-09e1deee4cb2"

  try {
    

    const {data, error} = await supabase.from("sets")
    .select(`
      set_id,
      reps,
      weight,
      exercise_id, set_number,
      total_volume,
      exercise!inner(exercise_name, body_part, equipment)
      `)
    .eq("session_id", "75dac6f6-d3b5-40ef-b788-09e1deee4cb2")

    if (error) throw new Error("Unable to fetch session Info: ", error)

 const prompt = ` 
 You are a fitness and exercise expert. Analyze the workout session data below and deliver a concise summary of key insights and actionable recommendations.

Requirements:

Stay within 100 words
Focus on the most meaningful patterns or performance indicators in the data
Recommendations should be specific and directly tied to what the data shows

Workout session data:

${JSON.stringify(data, null, 2)}
 `

      const geminiKey = Deno.env.get("GEMINI_API_KEY")

      console.log("Gemini Has Key?", !!geminiKey)

      const geminiRequest = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
{method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    contents: [
      {
        parts: [{text: prompt}]
      }
    ]
  })
}
      )

      const response = await geminiRequest.json()
      const geminiResponse = response.candidates[0].content.parts[0].text

    



  } catch (error) {
    console.log(error)
    return new Response(JSON.stringify("Error. try again"),
    {headers: {"Content-Type": "application/json"}},
  )}

  
    


  return new Response(
    JSON.stringify("end"),
    { headers: { "Content-Type": "application/json" }},
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-ai-session-recommendations' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
