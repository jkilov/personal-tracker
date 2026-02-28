import { supabase } from "./client-supabase";



export const createSet = async() => {

    const {data, error} = await supabase
    .from("sets")
    .insert([])
}