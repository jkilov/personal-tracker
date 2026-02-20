import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_API_URL,
import.meta.env.VITE_API_KEY);

export const signUpUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.log("Unsuccessful signup: ", error);
 
  } else {
  console.log("Successfully signed up: ", data);
}

return {data, error}
};


export const signInUser = async(email: string, password: string) =>{
const {data, error} = await supabase.auth.signInWithPassword({
  email,
  password,
})
if (error){
  console.log("failed sign in: ", error)
  return
} else {
  console.log("successful sign in: ", data)
}
return {data, error}

}


