import { type Session } from "@supabase/supabase-js";
import { supabase } from "./client-supabase";



export const signUpUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });


return {data, error}
};


export const signInUser = async(email: string, password: string) =>{
const {data, error} = await supabase.auth.signInWithPassword({
  email,
  password,
})


return {data, error}


}



export const getUser = async() => {

  const {data : {user}} = await supabase.auth.getUser()

  return user
}



export const authenticationCheck = (callback: (session: Session | null) => void ) => {

  const {data: {subscription}} = supabase.auth.onAuthStateChange((_, session) => {
    callback(session);
  })

  return subscription
}


