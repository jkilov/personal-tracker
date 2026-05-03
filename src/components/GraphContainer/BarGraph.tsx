import { type FetchedTrainingData } from "./useGraphMetrics";

interface Props {
  rawTrainingData: FetchedTrainingData[];
}

const BarGraph = ({ rawTrainingData }: Props) => {
  const completedExercises = rawTrainingData.map(
    (exercise) => exercise.session.sets[1].exercise.exercise_name
  );

  console.log("T", completedExercises);

  return <div></div>;
};

export default BarGraph;

//⭐️questions

//const BarGraph = ({ rawTrainingData }: Props) => {
// const completedExercises = rawTrainingData.map(
//     (exercise, index) => exercise.session.sets
//   );

//   console.log("T", completedExercises);

//   return (
//     <div>
//       {completedExercises.map((exercise) => (
//         <select>
//           <option>{exercise.exercise.exercise_name}</option>
//         </select>
//       ))}
//     </div>
//   );
// };

// when i tried to map over to get the exercise name for some reason it was not working it would nt find exercise

// const BarGraph = ({ rawTrainingData }: Props) => {
//   const completedExercises = rawTrainingData.map(
//     (exercise, index) => exercise.session.sets[0]
//   );

//the above also would not work
//issue with mapping over nested Arrays and getting access to them
