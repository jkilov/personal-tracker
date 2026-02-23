import { supabase } from "./client-supabase";


//CREATE

export const createUserData = async(userId: string, fName: string, lName: string, email: string) => {
    const {error, status, statusText} = await supabase.from("user").insert({
       user_id: userId,  first_name: fName, last_name: lName, email,
    })

    return {error, status, statusText}
}