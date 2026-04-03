import { useState } from "react";
import { Toaster, toast } from "sonner";
import { readUserData } from "../../utils/supabase/user";
import { createSession } from "../../utils/supabase/session";
import { useNavigate } from "react-router";
import { PulseLoader } from "react-spinners";
import "../../App.css";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSession = async () => {
    setIsLoading(true);

    const { data: userData } = await readUserData();
    const uid = userData.user_id;

    const { data: sessionData, error } = await createSession(uid);

    if (error) {
      toast.error("session already exists", {
        style: { background: "var(--error)" },
      });
      setIsLoading(false);
      return;
    }

    const sessionId = sessionData?.session_id;
    setIsLoading(true);
    toast.success("New session created", {
      duration: 2000,
      style: { background: "var(--success)" },
      onAutoClose: () => {
        setIsLoading(false);
        navigate(`/modal/${sessionId}`);
      },
    });
  };

  return (
    <div className="dashboard-layout">
      <h1>Home</h1>
      <h2>Past Sessions</h2>

      <h2>What would you like to do?</h2>

      <button onClick={handleCreateSession}>
        {isLoading ? (
          <PulseLoader color={"var(--neutral)"} size={5} />
        ) : (
          "Add Session"
        )}
      </button>
      <Toaster />
    </div>
  );
};

export default Dashboard;
