import "./InsightsModal.css";
import { useRef, useState, useEffect } from "react";
import { GoGraph } from "react-icons/go";

import { retrieveSession } from "../../utils/supabase/auth-supabase";
import { type FormattedSetData } from "../SessionCard";
import Tooltip from "../Tooltip";
import { TrophySpin } from "react-loading-indicators";
import { PiCursorClick } from "react-icons/pi";

interface Props {
  sessionId: string;
}

const InsightsModal = ({ sessionId }: Props) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = () => {
    if (dialogRef.current) dialogRef.current.showModal();
  };

  const closeModal = () => {
    if (dialogRef.current) dialogRef.current.close();
  };

  const getInsights = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    const data = await fetch(
      `https://sudaxmkqsdilkjylccqu.supabase.co/functions/v1/get-ai-session-recommendations/${sessionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    //TODO: the current setup doesnt pass the sessionID to Gemini, need to extract session ID when user clicks insights modal

    const response = await data.json();
    setAiInsight(response.message);
    setIsLoading(false);
  };

  useEffect(() => {
    const retrieveAccessToken = async () => {
      const { data, error } = await retrieveSession();

      if (error) return;
      console.log("token: ", data.session?.access_token);
      setAccessToken(data.session?.access_token);
    };

    retrieveAccessToken();
  }, []);

  useEffect(() => {}, []);

  return (
    <div>
      <div className="insights-button ">
        <span>See Workout Insights</span>
        <GoGraph className="insights-icon" onClick={openModal} />
      </div>

      <dialog ref={dialogRef} className="insights-card">
        <div>
          <div className="session-header">
            <div>
              <h2>Session Overview</h2>
              <Tooltip
                children={
                  <div>
                    <h6>Total Volume</h6>
                    <span>
                      Raw workload. Adds up reps × weight for every set.
                    </span>
                    <h6>Adjusted Volume</h6>
                    <span>
                      Rep-range weighted volume. Sets in more effective
                      hypertrophy ranges count slightly more than very low or
                      very high reps.
                    </span>
                  </div>
                }
              />
            </div>
            <button onClick={closeModal}>X</button>
          </div>
        </div>
        <h3>Insights</h3>
        {/* 
        {formattedSetData.map((exercise) => (
          <div key={exercise.exerciseName}>
            <span className="body-part-pill">{exercise.body_part}</span>
          </div>
        ))}
        {formattedSetData.map((exercise) => (
          <div key={exercise.exerciseName}>
            <h3>{exercise.exerciseName}</h3>
            <table>
              <thead>
                <tr>
                  <th>Total Volume</th>
                  <th>Adjusted Volume</th>
                </tr>
              </thead>
              <tbody>
                {exercise.sets.map((set, index) => (
                  <tr key={exercise.exerciseName + "-" + index}>
                    <td>{set.setNumber}</td>
                    <td>
                      {set.set_volume}
                      <span className="weight-label"> KG</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3>Volume Progression</h3>
          </div>
        ))} */}
        <span></span>
        <span></span>
        <h3>Recommendations</h3>
        <div>
          <span onClick={getInsights} className="ai-recommendation-btn">
            {!aiInsight ? (
              <>
                View your AI Coach Recommendations <PiCursorClick />{" "}
              </>
            ) : null}
          </span>
        </div>

        <span className="ai-recommendation-response">
          {isLoading ? (
            <TrophySpin
              color="#7F7CAF"
              size="small"
              text="analyzing"
              textColor=""
            />
          ) : (
            aiInsight
          )}
        </span>
      </dialog>
    </div>
  );
};

export default InsightsModal;
