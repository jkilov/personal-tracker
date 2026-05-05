import { useState } from "react";
import { type FetchedTrainingData } from "./useGraphMetrics";

interface Props {
  rawTrainingData: FetchedTrainingData[];
}

const BarGraph = ({ rawTrainingData }: Props) => {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const completedExercises = rawTrainingData.flatMap((exercise) =>
    exercise.session.sets.map((set) => set.exercise.exercise_name)
  );

  const exerciseName = [...new Set(completedExercises)];

  console.log("RR", rawTrainingData);

  const newArr = rawTrainingData.map((el) =>
    el.session.sets.filter(
      (element) => element.exercise.exercise_name === selectedExercise
    )
  );

  // ✅this produces an arrray of arrays - where some eeents are empty and the other contains the exercises selected by the user

  console.log("n", newArr);
  //as per my learnings this doesnt need to go inside of a useEffect as we can derive and useEffect just for side effects

  const barGraphDataObj = rawTrainingData.reduce((acc, el) => {
    for (let i = 0; i < el.session.sets.length; i++) {
      const exerciseName = el.session.sets[i].exercise.exercise_name;

      const setVolume = el.session.sets[i].set_volume;
      const date = el.session.session_date;

      acc[date] = { exerciseName, setVolume };
    }

    return acc;
  }, {} as Record<string, number | string>);

  const handleExerciseSelection = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setSelectedExercise(event.target.value);
  };

  return (
    <div>
      <select onChange={handleExerciseSelection}>
        {exerciseName.map((exercise) => (
          <option key={exercise} value={exercise}>
            {exercise}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BarGraph;
