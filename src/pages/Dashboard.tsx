import { useState } from "react";

import { readUserData } from "../utils/supabase/user";
import { createSession } from "../utils/supabase/session";

import { useNavigate } from "react-router";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");

  //does the above need to be in a useEffect as we are making server calls - lso needs loading state

  const handleCreateSession = async () => {
    const { data: userData } = await readUserData();

    const uid = userData.user_id;
    setUserId(uid);

    const { data } = await createSession(uid);

    const sessionId = data?.session_id;

    navigate(`/modal/${sessionId}`);
  };

  console.log(userId);

  return (
    <div>
      <h1>Dashboard</h1>

      <button onClick={handleCreateSession}>Add Session</button>
    </div>
  );
};

export default Dashboard;
