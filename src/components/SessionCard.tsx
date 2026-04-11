import { useState, useEffect } from "react";
// import { useParams } from "react-router";
import {
  readSetWithExerciseData,
  type SessionInfo,
} from "../utils/supabase/set";
import { IoIosArrowDown } from "react-icons/io";
import "./SessionCard.css";
import InsightsModal from "./InsightsModal";
import {
  type FitnessScores,
  getFitnessScoresBySession,
} from "../utils/supabase/fitness-score";

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
  const [formattedSetData, setFormattedSetData] = useState<
    FormattedSetData[] | undefined
  >(undefined);

  const [rawSessionData, setRawSessionData] = useState<SessionInfo[] | null>(
    null
  );

  const [fitnessScores, setFitnessScores] = useState<FitnessScores[] | null>(
    null
  );

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

  useEffect(() => {
    const getFitnessScores = async () => {
      const { data, error } = await getFitnessScoresBySession(sessionId);
      setFitnessScores(data);
      console.log(data);
    };

    getFitnessScores();
  }, [sessionId]);

  //TODO: ADD FITNIESS SCORE HERE

  const toggleAdditionalSetInfo = (exerciseName: string) => {
    const updatedIsOpen = formattedSetData?.map((exercise) =>
      exercise.exerciseName === exerciseName
        ? { ...exercise, isOpen: !exercise.isOpen }
        : exercise
    );

    setFormattedSetData(updatedIsOpen);
  };

  //FIXME: below there are two conditional checks on formattedSetData - this needs to be refactored
  return (
    <div className="card-layout">
      {fitnessScores?.map((score) => (
        <div key={score.session_Id}>
          <span>Adjusted Volume{score.adjusted_daily_volume}kg</span>
          <span>Total Volume: {score.total_daily_volume}kg</span>
        </div>
      ))}
      {formattedSetData ? (
        // Two conditionals on the same data -refactor
        <InsightsModal
          sessionId={sessionId}
          formattedSetData={formattedSetData}
        />
      ) : null}
      {formattedSetData &&
        //TODO: check if using formattedSetData twice together is correct
        formattedSetData.map((exercise) => (
          <div key={exercise.exerciseName}>
            <div>
              <div className="card-exercise-layout ">
                <div className="card-text-graph-layout">
                  <span>{exercise.exerciseName}</span>
                  <span>Sets: {exercise.sets.length}</span>
                </div>
                <IoIosArrowDown
                  className="clickable-icon"
                  onClick={() => toggleAdditionalSetInfo(exercise.exerciseName)}
                />
              </div>
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

                {exercise.sets.map((set) => (
                  <tbody key={`${exercise.exerciseName}-${set.setNumber}`}>
                    <tr>
                      <td>{set.setNumber}</td>
                      <td>{set.reps}</td>
                      <td>{set.weight}</td>
                    </tr>
                  </tbody>
                ))}
              </table>
            )}
          </div>
        ))}
    </div>
  );
};

export default SessionCard;
