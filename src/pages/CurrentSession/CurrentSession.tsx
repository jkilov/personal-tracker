import { useState, useEffect } from "react";
import { useParams } from "react-router";
import {
  type SessionInfo,
  readSetWithExerciseData,
} from "../../utils/supabase/set";
import "./CurrentSession.css";
import SessionModal from "../../components/SessionModal/SessionModal";
import { toast } from "sonner";
import SessionCard from "../../components/SessionCard/SessionCard";

const CurrentSession = () => {
  const [currentSessionData, setCurrentSessionData] = useState<
    SessionInfo[] | null
  >(null);

  const params = useParams();
  const sessionId = params.sessionId;

  useEffect(() => {
    const getSessionInfo = async () => {
      const { data, error } = await readSetWithExerciseData(sessionId!);

      if (error) {
        toast.error(
          <div className="toast">
            <span>
              <strong>There was an error</strong>.
            </span>
            <span>{error.message}</span>
          </div>,
          { style: { background: "var(--toast-error)" } }
        );
        console.error("error loading Session Info: ", {
          message: error.message,
          cause: error.cause,
          hint: error.hint,
          details: error.details,
        });
        return;
      }
      setCurrentSessionData(data);
    };

    getSessionInfo();
  }, [sessionId]);

  return (
    <div className="page-container" key="current-session">
      <div className="session-container">
        <h2>Your Current Session</h2>
        <SessionModal />

        <SessionCard sessionId={sessionId!} />
      </div>
    </div>
  );
};

export default CurrentSession;
