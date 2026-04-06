import { useState, useEffect } from "react";
// import { useParams } from "react-router";
import {
  readSetWithExerciseData,
  type SessionInfo,
} from "../utils/supabase/set";
import { IoIosArrowDown } from "react-icons/io";
import "./SessionCard.css";
import InsightsModal from "./InsightsModal";

export type SetData = {
  setNumber: number;
  reps: number;
  weight: number;
  total_volume?: number;
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

  // const sessionIdParam = useParams();

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
        total_volume: el.total_volume,
      });

      return acc;
    }, {} as Record<string, { exerciseName: string; body_part: string; createdAt: string; isOpen: boolean; sets: { setNumber: number; reps: number; weight: number; total_volume: number }[] }>);
    const exerciseSetArr = Object.values(reshapedExerciseData);
    setFormattedSetData(exerciseSetArr);
  }, [rawSessionData]);

  const toggleAdditionalSetInfo = (exerciseName: string) => {
    const updatedIsOpen = formattedSetData?.map((exercise) =>
      exercise.exerciseName === exerciseName
        ? { ...exercise, isOpen: !exercise.isOpen }
        : exercise
    );

    setFormattedSetData(updatedIsOpen);
  };

  console.log("formatted", formattedSetData);

  //FIXME: below there are two conditional checks on formattedSetData - this needs to be refactored
  return (
    <div className="card-layout">
      {formattedSetData ? (
        // Two conditionals on the same data -refactor
        <InsightsModal
          sessionId={sessionId} //changed this from sessionIDParams
          formattedSetData={formattedSetData}
        />
      ) : null}
      {formattedSetData &&
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
