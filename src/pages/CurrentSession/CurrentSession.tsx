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
import { IoChevronBackSharp } from "react-icons/io5";
import { useNavigate } from "react-router";

const CurrentSession = () => {
  const [currentSessionData, setCurrentSessionData] = useState<
    SessionInfo[] | null
  >(null);
  const [resetCount, setResetCount] = useState(0);

  const params = useParams();
  const sessionId = params.sessionId;
  const navigate = useNavigate();

  //FIXME: fix useState here
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

  const saveSessionExercise = () => {
    setResetCount((prev) => prev + 1);
    toast.success(
      <div className="toast">
        <span>
          <strong>Exercise Saved</strong>.
        </span>
        <span>Exercise Saved to Session</span>
      </div>,
      { style: { background: "var(--toast-error)" } }
    );
  };

  const handlePreviousPage = () => {
    navigate(-1);
  };

  return (
    <div className="page-layout">
      <div onClick={handlePreviousPage} className="back-btn">
        <IoChevronBackSharp />
      </div>
      <h1>Your Current Session</h1>
      <div className="page-container ">
        <SessionModal onSave={saveSessionExercise} />
        <div className="current-session">
          <h2>Exercises</h2>
          <SessionCard
            resetKey={resetCount}
            sessionId={sessionId}
            showInsights={false}
          />
        </div>
      </div>
    </div>
  );
};

export default CurrentSession;
