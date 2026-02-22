import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getUser } from "../utils/supabase-auth";

const Dashboard = () => {
  const [authData, setAuthData] = useState<User | null>(null);

  useEffect(() => {
    const getUserDetails = async () => {
      const user = await getUser();
      setAuthData(user);
    };

    getUserDetails();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <span>{authData?.email}</span>
    </div>
  );
};

export default Dashboard;
