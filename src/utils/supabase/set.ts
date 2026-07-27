
import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "./client-supabase";
import type { MergeSet } from "../../components/AddSet/AddSet";

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
  user_id: string
  set_volume: number;
};


type readSetWithExerciseDataResponse = {
  data: SessionInfo [] | null;    
  error: PostgrestError| null
}


export const createNewSet = async(setArr: MergeSet[]) => {

  try {
    const {data: setData, error: setError}: {data: SessionInfo[] | null; error: PostgrestError | null} = await supabase
    .from("sets")
    .insert(setArr)
    .select('*')


if (setError) {
  console.error("Supabase insert error:", {
    message: setError.message,
    code: setError.code,
    details: setError.details,
    hint: setError.hint,
  })
  throw new Error(`error occurred when writing set information: ${setError.message}`, { cause: setError })
}
  if (!setData) throw new Error("No data returned for calculation")

      return {data: setData, error: null}
    
    
  } catch (error) {
    console.error(error)
    return {data: null, error}
    
  }
  
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