// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import {createClient} from "jsr:@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
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

// External input: reject anything that is not a UUID before it reaches the database.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

if (!UUID_PATTERN.test(sessionId)) {
  return new Response(
    JSON.stringify({message: "Invalid session id"}),
    {status: 400, headers: {...corsHeaders, "Content-Type": "application/json"}}
  )
}

// The service-role client bypasses RLS, so ownership must be checked here:
// resolve the caller from their JWT and only query their own sets.
const authHeader = req.headers.get("Authorization") ?? ""

if (!/^bearer /i.test(authHeader)) {
  return new Response(
    JSON.stringify({message: "Unauthorized"}),
    {status: 401, headers: {...corsHeaders, "Content-Type": "application/json"}}
  )
}

const jwt = authHeader.slice("Bearer ".length)

const {data: userData, error: userError} = await supabase.auth.getUser(jwt)

if (userError || !userData?.user) {
  return new Response(
    JSON.stringify({message: "Unauthorized"}),
    {status: 401, headers: {...corsHeaders, "Content-Type": "application/json"}}
  )
}

    const {data, error} = await supabase.from("sets")
    .select(`
      set_id,
      reps,
      weight,
      exercise_id, set_number,
      set_volume,
      exercise!inner(exercise_name, body_part, equipment)
      `)
    .eq("session_id", sessionId)
    .eq("user_id", userData.user.id)

      if (error) {
        console.error("Unable to fetch session info:", error)
        throw new Error("Unable to fetch session info")
      }

      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({message: "No session data found"}),
          {status: 404, headers: {...corsHeaders, "Content-Type": "application/json"}}
        )
      }

 const prompt = ` 
 You are a fitness and exercise expert. Analyze the workout session data below and deliver a concise summary of key insights and actionable recommendations.

Requirements:

- Stay within 100 words.
- Reps refer to the amount of repetitions an exercise as done. All weights are in KG.
- remove special characters from your response
Focus on the most meaningful patterns or performance indicators in the data. Be sure to use actual data in your response that hs been shared with you.
Recommendations should be specific and directly tied to what the data shows

Use the workout session data that is delimited by quotation marks:

"${JSON.stringify(data, null, 2)}"
 `

      const geminiKey = Deno.env.get("GEMINI_API_KEY")

      if (!geminiKey) throw new Error("GEMINI_API_KEY is not configured")

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

      const geminiResponse = response?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!geminiResponse) {
        throw new Error("Gemini returned no usable text response");
      }

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
    // Log full detail server-side; never return internals to the client.
    console.error(error)
    return new Response(
      JSON.stringify({message: "Internal server error"}),
      {
        status: 500,
        headers: {...corsHeaders, "Content-Type": "application/json"},
      },
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-ai-session-recommendations' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
