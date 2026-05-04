import { type FetchedTrainingData } from "./useGraphMetrics";

interface Props {
  rawTrainingData: FetchedTrainingData[];
}

const BarGraph = ({ rawTrainingData }: Props) => {
  const completedExercises = rawTrainingData.flatMap((exercise) =>
    exercise.session.sets.map((set) => set.exercise.exercise_name)
  );

  const exerciseName = [...new Set(completedExercises)];

  const handleExerciseSelection = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const selectedExercise = event.target.value;
    console.log(selectedExercise);
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
