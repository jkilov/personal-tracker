import { useState } from "react";
import { toast } from "sonner";
import { readUserData } from "../../utils/supabase/user";
import {
  createSession,
  fetchSessionIdByDate,
} from "../../utils/supabase/session";
import { toLocalIsoDate } from "../../utils/helper/localDateConversion";
import { signOutUser } from "../../utils/supabase/auth-supabase";
import { useNavigate } from "react-router";
import { PulseLoader } from "react-spinners";
import "../../App.css";
import "./Dashboard.css";
import SessionCalendar from "../../components/SessionCalendar/SessionCalendar";
import InsightsGraphs from "../../components/GraphContainer/GraphContainer";

const Dashboard = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSession = async () => {
    setIsLoading(true);

    const { data: userData, error: userError } = await readUserData();

    if (userError || !userData) {
      toast.error("Unable to load your profile", {
        style: { background: "var(--error)" },
      });
      setIsLoading(false);
      return;
    }

    const { data: sessionData, error } = await createSession(userData.user_id);

    if (error) {
      const { data: existingSession } = await fetchSessionIdByDate(
        toLocalIsoDate(new Date())
      );

      if (existingSession?.session_id) {
        setIsLoading(false);
        navigate(`/session/${existingSession.session_id}`);
        return;
      }

      toast.error("Unable to create session", {
        style: { background: "var(--error)" },
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    toast.success("New session created", {
      duration: 2000,
      style: { background: "var(--success)" },
    });
    navigate(`/session/${sessionData?.session_id}`);
  };

  const handleSignOut = async () => {
    const { error } = await signOutUser();

    if (error) {
      toast.error(error.message, {
        style: { background: "var(--error)" },
      });
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-header">
        <h1>Home</h1>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
      <div className="add-session">
        <h2>Start a New Workout</h2>

        <button onClick={handleCreateSession}>
          {isLoading ? (
            <PulseLoader color={"var(--neutral)"} size={5} />
          ) : (
            "Start New Session"
          )}
        </button>
      </div>

      <div className="graph-section">
        <h2>Workout Analytics</h2>
        <div>
          <InsightsGraphs />
        </div>
      </div>

      <h2>Training History</h2>
      <SessionCalendar />
    </div>
  );
};

export default Dashboard;
