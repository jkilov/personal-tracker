import { useState, useEffect } from "react";
import { readExerciseData } from "../utils/supabase/exercise";
import AddSet from "./AddSet";
import { useParams } from "react-router";
import {
  readSetWithExerciseData,
  type SessionInfo,
} from "../utils/supabase/set";

type ExerciseData = {
  exercise_id: string;
  exercise_name: string;
  body_part: string;
  media_url: string;
  equipment: string;
};

type SetData = {
  setNumber: number;
  reps: number;
  weight: number;
};

type FormattedSetData = {
  exerciseName: string;
  sets: SetData[];
};

//TODO: need to create a type for what session data returns from readSet

const SessionModal = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [exerciseData, setExerciseData] = useState<ExerciseData[] | null>([]);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseData | null>(
    null
  );
  const [rawSessionData, setRawSessionData] = useState<SessionInfo[] | null>(
    null
  );

  const [formattedSetData, setFormattedSetData] = useState<
    FormattedSetData[] | null
  >(null);

  const sessionIdParam = useParams();

  useEffect(() => {
    const getSessionData = async () => {
      const { data: sessionInformation, error } = await readSetWithExerciseData(
        sessionIdParam.sessionId!
      );

      console.log("SD", sessionInformation);
      setRawSessionData(sessionInformation);

      //TODO: handle data and errror here - data goes into state and gets mapped over
    };

    getSessionData();
  }, [sessionIdParam]);

  useEffect(() => {
    if (!rawSessionData) return;

    const reshapedExerciseData = rawSessionData?.reduce((acc, el) => {
      const exerciseName = el.exercise.exercise_name;

      if (!acc[exerciseName]) {
        acc[exerciseName] = {
          exerciseName,
          sets: [],
        };
      }

      acc[exerciseName].sets.push({
        setNumber: el.set_number,
        reps: el.reps,
        weight: el.weight,
      });

      console.log("ac", acc);
      return acc;
    }, {} as Record<string, { exerciseName: string; sets: { setNumber: number; reps: number; weight: number }[] }>);
    const exerciseSetArr = Object.values(reshapedExerciseData);
    console.log("E", exerciseSetArr);
    setFormattedSetData(exerciseSetArr);
  }, [rawSessionData]);

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      const getExerciseData = async () => {
        const data = await readExerciseData();
        setExerciseData(data);
        setIsLoading(false);
      };
      getExerciseData();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleExerciseSelection = (selectedExerciseName: string) => {
    const selectedExerciseData = exerciseData?.find(
      (element) => element.exercise_name === selectedExerciseName
    );

    setSelectedExercise(selectedExerciseData!);
  };

  if (isLoading) return <div>Loading.</div>;

  return (
    <div>
      <div>
        {formattedSetData &&
          formattedSetData.map((set) => <span>{set.exerciseName}</span>)}
      </div>
      <div>
        <h3>Add Workout</h3>
        <form>
          <label htmlFor="exerciseList">Select Exercise</label>
          <select
            name="exerciseList"
            id="exerciseList"
            onChange={(e) => handleExerciseSelection(e.target.value)}
          >
            <option value="" disabled selected>
              Select an exercise
            </option>
            {exerciseData?.map((exercise) => (
              <option
                id={exercise.exercise_id}
                value={exercise.exercise_name}
                key={exercise.exercise_id}
                data-user-exercise="test" //need to fix
              >
                {exercise.exercise_name}
              </option>
            ))}
          </select>
        </form>
        {selectedExercise && (
          <div>
            <AddSet exerciseId={selectedExercise.exercise_id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionModal;
