import { supabase } from "./client-supabase";



export const createNewSet = async(setArr: any) => {

    const {data, error} = await supabase
    .from("sets")
    .insert(setArr)
    return {data, error}
}