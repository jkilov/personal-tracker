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