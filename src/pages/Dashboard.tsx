import { useState } from "react";
import { Toaster, toast } from "sonner";
import { readUserData } from "../utils/supabase/user";
import { createSession, fetchSessionData } from "../utils/supabase/session";
import { useNavigate } from "react-router";
import { ClipLoader } from "react-spinners";
import "../App.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [isSessionExists, setIsSessionExists] = useState<boolean | undefined>(
    false
  );

  const [isLoading, setIsLoading] = useState(false);

  //does the above need to be in a useEffect as we are making server calls - lso needs loading state

  //TODO: the below needs to be broken jp into helper functions
  //TODO: need to add some loading indicators when API calls are being made
  const handleCreateSession = async () => {
    const data = await fetchSessionData("created_at");
    const sessionCreatedDate = data.data;
    const newArr = sessionCreatedDate?.map((date) =>
      date.created_at.split("T")
    );
    const justDate = newArr?.map((date) => date[0]);
    const todayUTC = new Date().toISOString().split("T")[0];
    const sessionExists = justDate?.includes(todayUTC);
    setIsSessionExists(sessionExists);

    if (sessionExists) {
      toast.error("session already exists", {
        style: { background: "var(--toast-error)" },
      });
      return;
    }

    const { data: userData } = await readUserData();
    const uid = userData.user_id;
    setUserId(uid);

    const { data: sessionData } = await createSession(uid);

    const sessionId = sessionData?.session_id;
    setIsLoading(true);
    toast.success("New session created", {
      duration: 2000,
      style: { background: "var(--toast-success)" },
      onAutoClose: () => {
        setIsLoading(false);
        navigate(`/modal/${sessionId}`);
      },
    });
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <button onClick={handleCreateSession}>
        {isLoading ? <ClipLoader /> : "Add Session"}
      </button>
      <Toaster />
    </div>
  );
};

export default Dashboard;
