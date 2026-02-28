
import { supabase } from "./client-supabase"

export const createSession = async(userId: string) => {
const {data, error, status, statusText} = await supabase.from("session").insert({user_id: userId}).select("session_id").single()

return {data, error, status, statusText}


}


