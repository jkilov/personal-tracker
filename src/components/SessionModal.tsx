import { useState, useEffect } from "react";
import { readExerciseData } from "../utils/supabase/exercise";
import AddSet from "./AddSet";

type ExerciseData = {
  exercise_id: string;
  exercise_name: string;
  body_part: string;
  media_url: string;
  equipment: string;
};

const SessionModal = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [exerciseData, setExerciseData] = useState<ExerciseData[] | null>([]);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseData | null>(
    null
  );

  const test = async () => {
    const data = await readExerciseData();
    console.log("D", data);
    setExerciseData(data);
  };

  useEffect(() => {
    let isMounted: boolean;
    isMounted = true;

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

  console.log(selectedExercise);

  return (
    <div>
      <h3>Add Workout</h3>

      <form>
        <h4>Select Exercise</h4>
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
              data-user-exercise="test"
            >
              {exercise.exercise_name}
            </option>
          ))}
        </select>
      </form>

      {selectedExercise && (
        <div>
          <AddSet />
          <button>Cancel</button>
          <button>Save</button>
        </div>
      )}
    </div>
  );
};

export default SessionModal;
