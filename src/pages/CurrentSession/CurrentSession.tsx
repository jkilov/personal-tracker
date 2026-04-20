import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { readSetWithExerciseData } from "../../utils/supabase/set";
import "./CurrentSession.css";
import { readUserData } from "../../utils/supabase/user";
import SessionModal from "../../components/SessionModal/SessionModal";

const CurrentSession = () => {
  const [liveTime, setLiveTime] = useState(() => new Date());

  const params = useParams();
  const sessionId = params.sessionId;

  useEffect(() => {
    const getSessionIno = async () => {
      const { data, error } = await readSetWithExerciseData(sessionId!);
    };
  }, [sessionId]);

  useEffect(() => {
    let count = 0;
  }, []);

  return (
    <div className="session-container">
      <span>{liveTime.getHours()} Time Count Down</span>
      <SessionModal />
    </div>
  );
};

export default CurrentSession;
