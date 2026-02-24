import { useState, useEffect } from "react";
import { readExerciseData } from "../utils/supabase/exercise";

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
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

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

  if (isLoading) return <div>Loading.</div>;

  return (
    <div>
      <h3>Add Workout</h3>

      <form>
        <h4>Select Exercise</h4>
        <select
          name="exerciseList"
          id="exerciseList"
          onChange={(e) =>
            console.log(e.currentTarget.selectedOptions[0].dataset.userExercise)
          }
        >
          <option value="" disabled selected>
            Select an exercise
          </option>
          {exerciseData?.map((exercise) => (
            <option
              value={exercise.exercise_name}
              key={exercise.exercise_id}
              data-user-exercise="test"
            >
              {exercise.exercise_name}
            </option>
          ))}
        </select>
      </form>

      <button onClick={test}>test</button>
    </div>
  );
};

export default SessionModal;
