import { useState } from "react";

import { readUserData } from "../utils/supabase/user";
import { createSession } from "../utils/supabase/session";

import { useNavigate } from "react-router";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");

  //does the above need to be in a useEffect as we are making server calls - lso needs loading state

  const handleCreateSession = async () => {
    const { data } = await readUserData();

    const userId = data![0].user_id;
    setUserId(userId);

    const { status, error } = await createSession(userId);
    console.log("error: ", error);
    console.log("status: ", status);

    navigate("/modal");
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <button onClick={handleCreateSession}>Add Session</button>
    </div>
  );
};

export default Dashboard;
