import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://sudaxmkqsdilkjylccqu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1ZGF4bWtxc2RpbGtqeWxjY3F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMDM1MjcsImV4cCI6MjA4Njg3OTUyN30.pQbyTYDZXvQABPU7373JUayQKvceYN90NsXWHP4e3Rw"
);

const signUpUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.log("Unsuccessful signup: ", error);
    return;
  }
  console.log("Successfully signed up: ", data);
};
