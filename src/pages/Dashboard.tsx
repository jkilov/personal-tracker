import { useState } from "react";

import { readUserData } from "../utils/supabase/user";
import { createSession, fetchSessionData } from "../utils/supabase/session";

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

  const testSessionDate = async () => {
    const data = await fetchSessionData("created_at");

    console.log(data.data);

    const testArr = data.data;

    const newArr = testArr?.map((date) => date.created_at.split("T"));

    const justDate = newArr?.map((date) => date[0]);

    const today = new Date().toISOString().split("T")[0];
    const sessionExists = justDate?.includes(today);

    console.group(today);
    console.log(sessionExists);
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <button onClick={handleCreateSession}>Add Session</button>
      <button onClick={testSessionDate}>get Date Test</button>
    </div>
  );
};

export default Dashboard;
