import { supabase } from "./client-supabase";



export const createNewSet = async(setArr: any) => {

    const {data, error} = await supabase
    .from("sets")
    .insert(setArr)
    return {data, error}
}


export const readSet = async()=> {
    const {data,error} = await supabase.from("sets")
    .select()
    .eq('session_id', '23cecd52-ca4a-4947-9078-1f36d35f8029')
    return {data,error} 

}