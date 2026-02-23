import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getUser } from "../utils/supabase/auth-supabase";

const Dashboard = () => {
  const [authData, setAuthData] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getUserDetails = async () => {
      const user = await getUser();
      if (isMounted) {
        setAuthData(user);
      }
    };

    getUserDetails();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddSession = () => {};

  return (
    <div>
      <h1>Dashboard</h1>
      <span>{authData?.email}</span>
      <button>Add Session</button>
    </div>
  );
};

export default Dashboard;
