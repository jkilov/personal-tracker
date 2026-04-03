import "./InsightsModal.css";
import { useRef, useState, useEffect } from "react";
import { GoGraph } from "react-icons/go";

import { retrieveSession } from "../utils/supabase/auth-supabase";
import { type FormattedSetData } from "./SessionCard";
import Tooltip from "./Tooltip";
import { TrophySpin } from "react-loading-indicators";
import { PiCursorClick } from "react-icons/pi";

interface Props {
  sessionId: string;
  formattedSetData: FormattedSetData[];
}

const InsightsModal = ({ sessionId, formattedSetData }: Props) => {
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

  const getRepMultiplier = (reps: number): number => {
    switch (true) {
      case reps >= 1 && reps <= 5:
        return 0.9;
      case reps >= 6 && reps <= 8:
        return 1;
      case reps >= 9 && reps <= 12:
        return 1.1;
      case reps >= 13 && reps <= 15:
        return 1;
      case reps >= 16 && reps <= 20:
        return 0.9;
      case reps >= 21:
        return 0.8;
      default:
        return 1;
    }
  };

  const adjustedVolume = (reps: number, weight: number) => {
    return reps * weight * getRepMultiplier(reps);
  };

  const getInsights = async () => {
    setIsLoading(true);
    const data = await fetch(
      `http://127.0.0.1:54321/functions/v1/get-ai-session-recommendations/${sessionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const response = await data.json();
    setAiInsight(response.message);
    setIsLoading(false);
  };

  useEffect(() => {
    const retrieveAccessToken = async () => {
      const { data, error } = await retrieveSession();

      if (error) return;

      setAccessToken(data.session?.access_token);
    };

    retrieveAccessToken();
  }, []);

  return (
    <div>
      <GoGraph className="insights-icon" onClick={openModal} />

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

          <span>chatGPT Input</span>
        </div>
        <h3>Insights</h3>

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
                  <th>Sets</th>
                  <th>Total Volume</th>
                  <th>Adjusted Volume</th>
                </tr>
              </thead>
              <tbody>
                {exercise.sets.map((set) => (
                  <tr key={set.setNumber}>
                    <td>{set.setNumber}</td>
                    <td>
                      {set.total_volume}
                      <span className="weight-label"> KG</span>
                    </td>
                    <td>
                      {Math.ceil(adjustedVolume(set.reps, set.weight))}
                      <span className="weight-label"> KG</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3>Volume Progression</h3>
          </div>
        ))}
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
