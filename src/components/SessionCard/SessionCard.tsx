import { useState, useEffect } from "react";
import Tooltip from "../Tooltip";
import { getInsights } from "../../services/getAiRecommendations";
import { TrophySpin } from "react-loading-indicators";

import {
  readSetWithExerciseData,
  type SessionInfo,
} from "../../utils/supabase/set";
import { IoIosArrowDown } from "react-icons/io";
import "./SessionCard.css";
import {
  type FitnessScores,
  getFitnessScoresBySession,
} from "../../utils/supabase/fitness-score";
import InsightsModal from "../InsightsModal/InsightsModal";

export type SetData = {
  setNumber: number;
  reps: number;
  weight: number;
  set_volume?: number;
};

export type FormattedSetData = {
  exerciseName: string;
  body_part: string;
  createdAt: string;
  isOpen?: boolean;
  sets: SetData[];
};

interface Props {
  sessionId: string;
  showInsights?: boolean;
  resetKey?: number;
}

//FIXME: refactor

const SessionCard = ({
  sessionId,
  showInsights = true,
  resetKey = 0,
}: Props) => {
  const [formattedSetData, setFormattedSetData] = useState<FormattedSetData[]>(
    []
  );

  const [rawSessionData, setRawSessionData] = useState<SessionInfo[] | null>(
    null
  );

  const [fitnessScores, setFitnessScores] = useState<FitnessScores | null>(
    null
  );
  const [isInsightsViewable, setIsInsightsViewable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

  //FIXME: refactor

  useEffect(() => {
    const getSessionData = async () => {
      const { data: sessionInformation, error } = await readSetWithExerciseData(
        sessionId
      );

      if (error) {
        console.error(error.message);
        return;
      }
      setRawSessionData(sessionInformation);
    };

    getSessionData();
  }, [resetKey, sessionId]);

  //FIXME: refactor

  useEffect(() => {
    if (!rawSessionData) return;

    const reshapedExerciseData = rawSessionData.reduce((acc, el) => {
      const exerciseName = el.exercise.exercise_name;

      if (!acc[exerciseName]) {
        acc[exerciseName] = {
          exerciseName,
          body_part: el.exercise.body_part,
          createdAt: el.created_at,
          isOpen: false,
          sets: [],
        };
      }

      acc[exerciseName].sets.push({
        setNumber: el.set_number,
        reps: el.reps,
        weight: el.weight,
        set_volume: el.set_volume,
      });

      return acc;
    }, {} as Record<string, { exerciseName: string; body_part: string; createdAt: string; isOpen: boolean; sets: { setNumber: number; reps: number; weight: number; set_volume: number }[] }>);
    const exerciseSetArr = Object.values(reshapedExerciseData);
    setFormattedSetData(exerciseSetArr);
  }, [rawSessionData]);

  const toggleAdditionalSetInfo = (exerciseName: string) => {
    const updatedIsOpen = formattedSetData.map((exercise) =>
      exercise.exerciseName === exerciseName
        ? { ...exercise, isOpen: !exercise.isOpen }
        : exercise
    );

    setFormattedSetData(updatedIsOpen);
  };

  const handleOpen = async () => {
    setIsInsightsViewable((prev) => !prev);
    const { data, error } = await getFitnessScoresBySession(sessionId);
    if (error) {
      console.error("error received: " + error);
    }
    setFitnessScores(data);
  };

  const handleClose = () => {
    setIsInsightsViewable(false);
  };

  const handleAiRecommendations = async () => {
    setIsLoading(true);
    const result = await getInsights(sessionId);
    if (!result.ok) {
      setIsLoading(false);
      return;
    }
    setIsLoading(false);

    setAiInsights(result.data.message);
  };

  return (
    <div className="card-layout" key={resetKey}>
      {showInsights && (
        <h5 className="insights-btn" onClick={handleOpen}>
          {isInsightsViewable ? "See Session Summary" : " See Insights "}
        </h5>
      )}
      <div className="card-viewport">
        <div
          className={`card-track ${isInsightsViewable ? "show-insights" : ""}`}
        >
          <div className="card-panel">
            <InsightsModal
              sessionId={sessionId}
              onClose={handleClose}
              isInsightsViewable={isInsightsViewable}
            />
            {formattedSetData.map((exercise) => (
              <div key={exercise.exerciseName}>
                <div>
                  <table>
                    <tr className="card-exercise-layout">
                      <td>
                        <h3>
                          {exercise.exerciseName}:{" "}
                          <span>{exercise.sets.length} Sets</span>
                        </h3>
                      </td>
                      <td>
                        <IoIosArrowDown
                          className={`clickable-icon ${
                            exercise.isOpen ? "icon-open" : ""
                          }`}
                          onClick={() =>
                            toggleAdditionalSetInfo(exercise.exerciseName)
                          }
                        />
                      </td>
                    </tr>
                  </table>
                </div>
                {exercise.isOpen && (
                  <table
                    className={`set-info ${
                      exercise.isOpen ? "set-info-visible" : ""
                    }`}
                  >
                    <thead>
                      <tr>
                        <th>Sets</th>
                        <th>Reps</th>
                        <th>Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.sets.map((set) => (
                        <tr key={`${exercise.exerciseName}-${set.setNumber}`}>
                          <td>{set.setNumber}</td>
                          <td>{set.reps}</td>
                          <td>
                            {set.weight}{" "}
                            <span className="weight-styling">kg</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
          {showInsights && (
            <div className="card-panel insights-panel">
              <div className="session-overview-header">
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
              <h3>Body Parts Trained</h3>
              <div className="body-parts-row">
                {formattedSetData.map((exercise) => (
                  <span
                    key={exercise.exerciseName}
                    className="body-part-pill"
                  >
                    {exercise.body_part}
                  </span>
                ))}
              </div>
              <h3>Volume Insights</h3>
              <table className="volume-insights">
                <thead>
                  <tr>
                    <td>Daily Volume</td>
                    <td>Adjusted Volume</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {fitnessScores?.total_daily_volume ?? "-"}
                      <span className="weight">kg</span>
                    </td>
                    <td>
                      {fitnessScores?.adjusted_daily_volume ?? "-"}
                      <span className="weight">kg</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div>
                <h3>Summary & Recommendations</h3>
                {isLoading ? (
                  <TrophySpin
                    color="#FFCB47"
                    size="small"
                    text="analyzing"
                    textColor=""
                  />
                ) : (
                  <h5
                    className="insights-btn"
                    onClick={handleAiRecommendations}
                  >
                    Generate with AI
                  </h5>
                )}
                <span>{aiInsights}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
