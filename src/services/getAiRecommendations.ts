import { retrieveSession } from "../utils/supabase/auth-supabase";

export const getInsights = async (sessionId: string, ) => {
 


  try {
    const {data: sessionData, error: sessionError} = await retrieveSession()

    if (sessionError) throw new Error("No session found: " + sessionError)

      if (!sessionData.session) throw new Error ("No session found: " + sessionError)  
 
        const accessToken = sessionData.session.access_token
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/functions/v1/get-ai-session-recommendations/${sessionId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
  })


  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Server ${res.status}: ${errBody}`)
  }
  const data = await res.json()
  return { ok: true, data } as const
  
} catch (error) {
  console.error(error)
  return { ok: false, error: error instanceof Error ? error.message : String(error) } as const
}
}

