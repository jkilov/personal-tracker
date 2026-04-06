// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import {createClient} from "jsr:@supabase/supabase-js@2"

console.log("Hello from Functions!")

const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
}

Deno.serve(async (req) => {
 

  if (req.method === "OPTIONS") {
    return new Response("ok", {headers: corsHeaders})
  }


  try {

const url = new URL(req.url)

const pathname = url.pathname
const splitPathname = pathname.split("/")
const sessionId = splitPathname[splitPathname.length-1]





    const {data, error} = await supabase.from("sets")
    .select(`
      set_id,
      reps,
      weight,
      exercise_id, set_number,
      total_volume,
      exercise!inner(exercise_name, body_part, equipment)
      `)
    .eq("session_id", sessionId)

      if (error) throw new Error("Unable to fetch session Info: " + error)

 const prompt = ` 
 You are a fitness and exercise expert. Analyze the workout session data below and deliver a concise summary of key insights and actionable recommendations.

Requirements:

- Stay within 100 words.
- Reps refer to the amount of repetitions an exercise as done. All weights are in KG.
- remove special characters from your response
Focus on the most meaningful patterns or performance indicators in the data. Be sure to use actual data in your response that hs been shared with you.
Recommendations should be specific and directly tied to what the data shows

Workout session data:

${JSON.stringify(data, null, 2)}
 `

      const geminiKey = Deno.env.get("GEMINI_API_KEY")

      if (!geminiKey) throw new Error("Auth issue accessing data")

      const geminiRequest = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
{method: "POST",
  headers: {
    "x-goog-api-key": geminiKey,
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


    
      if (!geminiRequest.ok) {
        throw new Error(`Gemini request failed with status ${geminiRequest.status}`);
      }
      
      const response = await geminiRequest.json();
      
      const geminiResponse = response.candidates[0].content.parts[0].text;

      return new Response(
        JSON.stringify({ message: geminiResponse }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );

  } catch (error) {
    console.log(error)
    console.log("finished")
    return new Response(JSON.stringify(error.message),
    {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"}},
  )}

  
    
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-ai-session-recommendations' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
