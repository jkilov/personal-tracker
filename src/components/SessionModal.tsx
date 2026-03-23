import { useState, useEffect } from "react";
import { readExerciseData } from "../utils/supabase/exercise";
import AddSet from "./AddSet";
import { useParams } from "react-router";
import { readSetWithExerciseData } from "../utils/supabase/set";

type ExerciseData = {
  exercise_id: string;
  exercise_name: string;
  body_part: string;
  media_url: string;
  equipment: string;
};

//TODO: need to create a type for what session data returns from readSet

const SessionModal = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [exerciseData, setExerciseData] = useState<ExerciseData[] | null>([]);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseData | null>(
    null
  );

  const sessionIdParam = useParams();

  console.log("SD", sessionIdParam);

  useEffect(() => {
    const getSessionData = async () => {
      const { data, error } = await readSetWithExerciseData(
        sessionIdParam.sessionId!
      );

      console.log("dataFromFetch", data);

      //TODO: handle data and errror here - data goes into state and gets mapped over
    };

    getSessionData();
  }, [sessionIdParam]);

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
  );
};

export default SessionModal;
