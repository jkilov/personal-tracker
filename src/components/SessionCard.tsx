import { useState, useEffect } from "react";
import { useParams } from "react-router";
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

const SessionCard = () => {
  const [formattedSetData, setFormattedSetData] = useState<
    FormattedSetData[] | null
  >(null);

  const [rawSessionData, setRawSessionData] = useState<SessionInfo[] | null>(
    null
  );

  const sessionIdParam = useParams();

  useEffect(() => {
    const getSessionData = async () => {
      const { data: sessionInformation, error } = await readSetWithExerciseData(
        sessionIdParam.sessionId!
      );

      console.log("S", sessionInformation);
      setRawSessionData(sessionInformation);

      //TODO: handle data and errror here - data goes into state and gets mapped over
    };

    getSessionData();
  }, [sessionIdParam]);

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

  return (
    <div className="card-layout">
      {formattedSetData &&
        formattedSetData.map((exercise) => (
          <div key={exercise.exerciseName}>
            <InsightsModal
              sessionId={sessionIdParam.sessionId!}
              formattedSetData={formattedSetData}
            />
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
                <tr>
                  <th>Sets</th>
                  <th>Reps</th>
                  <th>Weight</th>
                </tr>

                {exercise.sets.map((set) => (
                  <div key={exercise.exerciseName}>
                    <tr>
                      <td>{set.setNumber}</td>
                      <td>{set.reps}</td>
                      <td>{set.weight}</td>
                    </tr>
                  </div>
                ))}
              </table>
            )}
          </div>
        ))}
    </div>
  );
};

export default SessionCard;
