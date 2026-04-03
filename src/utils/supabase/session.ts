
import { supabase } from "./client-supabase"

export const createSession = async(userId: string) => {
const {data, error, status, statusText} = await supabase.from("session").insert({user_id: userId}).select("session_id").single()

return {data, error, status, statusText}

}

export type Session = {
    session_id: string;
   session_date: string; 
   created_at: string;
}


export const fetchSessionData = async() => {

    const {data, error, status} = await supabase
    .from("session")
    .select("*")


    return {data, error, status}
}

