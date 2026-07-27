import { useState } from "react";
import { type FetchedTrainingData } from "./useGraphMetrics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./GraphContainer.css";

interface Props {
  rawTrainingData: FetchedTrainingData[];
}

const BarGraph = ({ rawTrainingData }: Props) => {
  const completedExercises = rawTrainingData.flatMap((exercise) =>
    exercise.session.sets.map((set) => set.exercise.exercise_name)
  );

  const exerciseName = [...new Set(completedExercises)];

  const [selectedExercise, setSelectedExercise] = useState<string>(
    exerciseName[0]
  );

  const validatedExercise = exerciseName.includes(selectedExercise)
    ? selectedExercise
    : exerciseName[0];

  const sessionsWithMatchingSets = rawTrainingData.filter((el) =>
    el.session.sets.some(
      (element) => validatedExercise === element.exercise.exercise_name
    )
  );

  const barGraphShape = sessionsWithMatchingSets.map((element) => ({
    date: element.session.session_date,
    rm: Math.max(
      ...element.session.sets
        .filter((set) => set.exercise.exercise_name === validatedExercise)
        .map((workout) => Math.round(workout.weight * (1 + workout.reps / 30)))
    ),
  }));

  const handleExerciseSelection = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setSelectedExercise(event.target.value);
  };

  return (
    <div className="graph">
      <h4>1 Rep Max</h4>
      <div className="bar-graph">
        <select onChange={handleExerciseSelection} value={validatedExercise ?? ""}>
          {exerciseName.map((exercise) => (
            <option key={exercise} value={exercise}>
              {exercise}
            </option>
          ))}
        </select>
        <ResponsiveContainer width="100%" aspect={1.618}>
          <BarChart
            data={barGraphShape}
            margin={{
              top: 5,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis dataKey="rm" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
              }}
              formatter={(value) => [`${value} kg`, "1 Rep Max"]}
            />
            <Bar
              dataKey="rm"
              name="1 Rep Max"
              fill="#7494EA"
              activeBar={{ fill: "#7CEA9C" }}
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarGraph;
