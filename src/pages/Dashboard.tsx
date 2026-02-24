import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getUser } from "../utils/supabase/auth-supabase";
import { readUserData } from "../utils/supabase/user";
import { createSession } from "../utils/supabase/session";

const Dashboard = () => {
  const [authData, setAuthData] = useState<User | null>(null);
  const [userId, setUserId] = useState("");

  // useEffect(() => {
  //   let isMounted = true;

  //   const getUserDetails = async () => {
  //     const user = await getUser();
  //     if (isMounted) {
  //       setAuthData(user);
  //     }
  //   };

  //   getUserDetails();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, []);

  //the below is how we get the user_id from the user table - we may need this in our sessions table

  const handleCreateSession = async () => {
    const { data } = await readUserData();

    const userId = data![0].user_id;
    setUserId(userId);

    const { status, error } = await createSession(userId);
    console.log("error: ", error);
    console.log("status: ", status);
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <button onClick={handleCreateSession}>Add Session</button>
    </div>
  );
};

export default Dashboard;
