import { useState, useEffect } from "react";
import Tooltip from "../Tooltip";
import { getInsights } from "../../services/getAiRecommendations";

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
}

const SessionCard = ({ sessionId }: Props) => {
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
  const [aiInsights, setAiInsights] = useState<Response | null>(null);

  useEffect(() => {
    const getSessionData = async () => {
      const { data: sessionInformation, error } = await readSetWithExerciseData(
        sessionId
      );

      console.group("S", sessionInformation);

      if (error) {
        console.error(error.message);
        return;
      }
      setRawSessionData(sessionInformation);
    };

    getSessionData();
  }, [sessionId]);

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

  // useEffect(() => {
  //   const getFitnessScores = async () => {
  //     const { data, error } = await getFitnessScoresBySession(sessionId);
  //     setFitnessScores(data);
  //   };

  //   getFitnessScores();
  // }, [sessionId]);

  //TODO: ADD FITNIESS SCORE HERE

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
    setFitnessScores(data);
  };

  const handleClose = () => {
    setIsInsightsViewable(false);
  };

  const handleAiRecommendations = async () => {
    const result = await getInsights(sessionId);
    if (!result.ok) {
      //show error on ui
      return;
    }

    setAiInsights(result.data);
  };

  // console.log("Ai", aiInsights?.body);

  return (
    <div className="card-layout">
      <h5 className="insights-btn" onClick={handleOpen}>
        {isInsightsViewable ? "See Session Summary" : " See Insights "}
      </h5>
      {!isInsightsViewable ? (
        <div>
          <InsightsModal
            onClose={handleClose}
            isInsightsViewable={isInsightsViewable}
          />
          {
            //TODO: check if using formattedSetData twice together is correct
            formattedSetData.map((exercise) => (
              <div key={exercise.exerciseName}>
                <div>
                  <table className="card-exercise-layout ">
                    <tr>
                      <td>
                        <h3>{exercise.exerciseName}</h3>
                      </td>
                      <td>
                        <span>Total Sets: {exercise.sets.length}</span>
                      </td>
                      <td>
                        <IoIosArrowDown
                          className="clickable-icon"
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
                          <td>{set.weight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))
          }
        </div>
      ) : (
        <div>
          <h2>Session Overview</h2>
          <Tooltip
            children={
              <div>
                <h6>Total Volume</h6>
                <span>Raw workload. Adds up reps × weight for every set.</span>
                <h6>Adjusted Volume</h6>
                <span>
                  Rep-range weighted volume. Sets in more effective hypertrophy
                  ranges count slightly more than very low or very high reps.
                </span>
              </div>
            }
          />
          <button>X</button>
          <h3>Body Parts Trained</h3>
          {formattedSetData.map((exercise) => (
            <div key={exercise.exerciseName}>
              <span className="body-part-pill">{exercise.body_part}</span>
            </div>
          ))}
          <h3>Volume Insights</h3>
          <table>
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
            <h5 className="insights-btn" onClick={handleAiRecommendations}>
              Generate with AI
            </h5>
            {/* <span>{handleAiRecommendations()}</span>
            <span>{aiInsights?.body}</span> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionCard;
