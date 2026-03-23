import type { Params } from "react-router";
import { supabase } from "./client-supabase";



export const createNewSet = async(setArr: any) => {

    const {data, error} = await supabase
    .from("sets")
    .insert(setArr)
    return {data, error}
}


export const readSet = async(sessionId: string | undefined)=> {
    const {data,error} = await supabase.from("sets")
    .select()
    .eq('session_id', sessionId)
    return {data,error} 

}



export const readSetWithExerciseData = async(sessionId: string) => {

    const {data,error} = await supabase.from("sets")
    .select(`
       set_id,
       reps,
       weight,
       session_id,
       exercise_id,
        set_number,
        created_at,
        exercise!inner(exercise_name, body_part)
        `)
    .eq('session_id', sessionId)
    return {data, error}
}