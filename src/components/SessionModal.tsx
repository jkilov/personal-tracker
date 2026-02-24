import { useState, useEffect } from "react";
import { readExerciseData } from "../utils/supabase/exercise";

const SessionModal = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [exerciseData, setExerciseData] = useState<any[] | null>([]);

  const test = async () => {
    const data = await readExerciseData();
    console.log("D", data);
    setExerciseData(data);
  };

  console.log(exerciseData);

  return (
    <div>
      <div>SessionModal</div>

      <form>
        <span>Select Exercise</span>
        {exerciseData?.map((exercise) => (
          <span>{exercise.equipment}</span>
        ))}
      </form>
      <button onClick={test}>test</button>
    </div>
  );
};

export default SessionModal;
