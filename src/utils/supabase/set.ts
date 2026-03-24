
import type { PostgrestError } from "@supabase/supabase-js";
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

export type Exercise = {
    body_part: string;
    exercise_name: string;
  };
  
  export type SessionInfo = {
    created_at: string;
    exercise: Exercise;
    exercise_id: string;
    reps: number;
    session_id: string;
    set_id: string;
    set_number: number;
    weight: number;
  };


  type readSetWithExerciseDataResponse = {
    data: SessionInfo [] | null;
    error: PostgrestError| null
  }


export const readSetWithExerciseData = async(sessionId: string):Promise<readSetWithExerciseDataResponse>  => {

    const {data, error} = await supabase.from("sets")
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
    return {data: data as SessionInfo[] | null, error}
}