
import { supabase } from "./client-supabase"

export const createSession = async(userId: string) => {
const {data, error, status, statusText} = await supabase.from("session").insert({user_id: userId}).select("session_id").single()

return {data, error, status, statusText}

}


export const fetchSessionData = async(columnName: string) => {

    const {data, error, status} = await supabase
    .from("session")
    .select(columnName)


    return {data, error, status}
}


