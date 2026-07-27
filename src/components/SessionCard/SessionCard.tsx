import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
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
  sets: SetData[];
};

interface Props {
  sessionId: string;
  showInsights?: boolean;
  resetKey?: number;
}

const SessionCard = ({
  sessionId,
  showInsights = true,
  resetKey = 0,
}: Props) => {
  const [rawSessionData, setRawSessionData] = useState<SessionInfo[] | null>(
    null
  );

  const [fitnessScores, setFitnessScores] = useState<FitnessScores | null>(
    null
  );
  const [isInsightsViewable, setIsInsightsViewable] = useState(false);
  const [openExercises, setOpenExercises] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const getSessionData = async () => {
      const { data: sessionInformation, error } = await readSetWithExerciseData(
        sessionId
      );

      if (cancelled) return;

      if (error) {
        console.error("Error loading session sets:", error.message);
        return;
      }
      setRawSessionData(sessionInformation);
    };

    getSessionData();

    return () => {
      cancelled = true;
    };
  }, [resetKey, sessionId]);

  const formattedSetData = useMemo<FormattedSetData[]>(() => {
    if (!rawSessionData) return [];

    const reshapedExerciseData = rawSessionData.reduce<
      Record<string, FormattedSetData>
    >((acc, el) => {
      const exerciseName = el.exercise.exercise_name;

      if (!acc[exerciseName]) {
        acc[exerciseName] = {
          exerciseName,
          body_part: el.exercise.body_part,
          createdAt: el.created_at,
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
    }, {});

    return Object.values(reshapedExerciseData);
  }, [rawSessionData]);

  const toggleAdditionalSetInfo = (exerciseName: string) => {
    setOpenExercises((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseName)) {
        next.delete(exerciseName);
      } else {
        next.add(exerciseName);
      }
      return next;
    });
  };

  const handleOpen = async () => {
    setIsInsightsViewable((prev) => !prev);
    const { data, error } = await getFitnessScoresBySession(sessionId);
    if (error) {
      console.error("Error loading fitness scores:", error);
    }
    setFitnessScores(data);
  };

  const handleAiRecommendations = async () => {
    setIsLoading(true);
    const result = await getInsights(sessionId);
    setIsLoading(false);

    if (!result.ok) {
      toast.error("Failed to load AI recommendations", {
        style: { background: "var(--error)" },
      });
      return;
    }

    setAiInsights(result.data.message);
  };

  return (
    <div className="card-layout">
      {showInsights && (
        <button type="button" className="insights-btn" onClick={handleOpen}>
          {isInsightsViewable ? "See Session Summary" : "See Insights"}
        </button>
      )}
      <div className="card-viewport">
        <div
          className={`card-track ${isInsightsViewable ? "show-insights" : ""}`}
        >
          <div className="card-panel">
            {formattedSetData.length === 0 && (
              <p className="empty-card-text">
                No exercises logged yet. Select an exercise to add your first
                sets.
              </p>
            )}
            {formattedSetData.map((exercise) => {
              const isOpen = openExercises.has(exercise.exerciseName);

              return (
                <div key={exercise.exerciseName}>
                  <div>
                    <table>
                      <tbody>
                        <tr className="card-exercise-layout">
                          <td>
                            <h3>
                              {exercise.exerciseName}:{" "}
                              <span>
                                {exercise.sets.length}{" "}
                                {exercise.sets.length === 1 ? "Set" : "Sets"}
                              </span>
                            </h3>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="icon-btn"
                              aria-label={`${isOpen ? "Hide" : "Show"} sets for ${exercise.exerciseName}`}
                              aria-expanded={isOpen}
                              onClick={() =>
                                toggleAdditionalSetInfo(exercise.exerciseName)
                              }
                            >
                              <IoIosArrowDown
                                className={`clickable-icon ${
                                  isOpen ? "icon-open" : ""
                                }`}
                              />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {isOpen && (
                    <table className="set-info set-info-visible">
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
              );
            })}
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
                {[
                  ...new Set(
                    formattedSetData.map((exercise) => exercise.body_part)
                  ),
                ].map((bodyPart) => (
                  <span key={bodyPart} className="body-part-pill">
                    {bodyPart}
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
                  <button
                    type="button"
                    className="insights-btn"
                    onClick={handleAiRecommendations}
                  >
                    Generate with AI
                  </button>
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
