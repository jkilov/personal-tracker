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
      <div>SessionModal</div>

      <form>
        <span>Select Exercise</span>
        {exerciseData?.map((exercise) => (
          <span>{exercise.exercise_name}</span>
        ))}
      </form>
      <button onClick={test}>test</button>
    </div>
  );
};

export default SessionModal;
