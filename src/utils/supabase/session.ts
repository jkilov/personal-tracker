
import { supabase } from "./client-supabase"

export const createSession = async(userId: string) => {
const {error, status, statusText} = await supabase.from("session").insert({user_id: userId})

return {error, status, statusText}
}