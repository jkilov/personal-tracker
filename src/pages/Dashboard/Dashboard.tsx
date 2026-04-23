import { useState, useEffect } from "react";
import { toast } from "sonner";
import { readUserData } from "../../utils/supabase/user";
import { createSession } from "../../utils/supabase/session";
import { useNavigate } from "react-router";
import { PulseLoader } from "react-spinners";
import "../../App.css";
import "./Dashboard.css";
import { fetchSessionData, type Session } from "../../utils/supabase/session";
import { UTCtoLocalDateConversion } from "../../utils/helper/localDateConversion";
import InsightsModal from "../../components/InsightsModal/InsightsModal";
import SessionCalendar from "../../components/SessionCalendar/SessionCalendar";

const Dashboard = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [allSessions, setAllSessions] = useState<Session[] | null>(null);

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
        //TODO:come back to
        navigate(`/session/${sessionId}`);
      },
    });
  };

  useEffect(() => {
    const getAllSessions = async () => {
      const { data: sessionArr, error } = await fetchSessionData();

      if (error) {
        console.error(error.message, error.cause);
      }

      setAllSessions(sessionArr);
    };

    getAllSessions();
  }, []);

  return (
    <div className="dashboard-layout">
      <h1>Home</h1>
      <h2>Training History</h2>
      <SessionCalendar />
      {/* <FtinessScoresGraph /> */}
      <h2>Your Past 7 Sessions</h2>
      <div className="sessions-list">
        {allSessions?.slice(0, 7).map((session) => (
          <div className="session-details" key={session.session_id}>
            <h3>{UTCtoLocalDateConversion(session.created_at)}</h3>
            <InsightsModal sessionId={session.session_id} />
            {/* //TODO: add sorting to show most recent first */}
          </div>
        ))}
      </div>

      <h2>What would you like to do?</h2>

      <button onClick={handleCreateSession}>
        {isLoading ? (
          <PulseLoader color={"var(--neutral)"} size={5} />
        ) : (
          "Start New Session"
        )}
      </button>
    </div>
  );
};

export default Dashboard;
