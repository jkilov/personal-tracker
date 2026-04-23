
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

    const {data, error} = await supabase
    .from("session")
    .select("*")


    return {data, error}
}

export type SessionByDate = {
    session_date: string;
    session_id: string;
    sets: []
}

export const fetchSessionByDate = async(date: string) => {

    const {data, error} = await supabase
    .from("session")
    .select(`
        session_date,
        session_id,
        sets!inner(reps, weight, exercise_id, set_number,
        exercise!inner(exercise_name, body_part)
        )
        `)
        .eq("session_date", date)
        .single()

        return {data, error}
}