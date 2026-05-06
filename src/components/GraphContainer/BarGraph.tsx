import { useState } from "react";
import { type FetchedTrainingData } from "./useGraphMetrics";

interface Props {
  rawTrainingData: FetchedTrainingData[];
}

const BarGraph = ({ rawTrainingData }: Props) => {
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const completedExercises = rawTrainingData.flatMap((exercise) =>
    exercise.session.sets.map((set) => set.exercise.exercise_name)
  );

  const exerciseName = [...new Set(completedExercises)];

  const containsExercise = rawTrainingData.filter((el) =>
    el.session.sets.some(
      (element) => selectedExercise === element.exercise.exercise_name
    )
  );

  const barGraphShape = containsExercise.map((element) => ({
    date: element.session.session_date,
    rm: Math.max(
      ...element.session.sets
        .filter((set) => set.exercise.exercise_name === selectedExercise)
        .map((workout) => Number(workout.weight * (1 + workout.reps / 30)))
    ),
  }));

  console.log("BG", barGraphShape);

  const handleExerciseSelection = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setSelectedExercise(event.target.value);
  };

  return (
    <div>
      <select onChange={handleExerciseSelection} value={selectedExercise}>
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

//questions
//if i want to add a for loop - can ido so inside like a map for filter method
