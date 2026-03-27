import "./InsightsModal.css";
import { useRef, useEffect, useState } from "react";
import { GoGraph } from "react-icons/go";
import { readSetWithExerciseData } from "../utils/supabase/set";
import { type SetData, type FormattedSetData } from "./SessionCard";

interface Props {
  sessionId: string;
  formattedSetData: FormattedSetData[];
}

const InsightsModal = ({ sessionId, formattedSetData }: Props) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [setData, setSetData] = useState<SetData[] | null>(null);
  const [exerciseVolume, setExerciseVolume] = useState<Record<
    string,
    number
  > | null>(null);

  // useEffect(() => {
  //   const fetchSessiondata = async () => {
  //     //TODO:need to create a loading state
  //     const { data, error } = await readSetWithExerciseData(sessionId);
  //     //TODO: handle error

  //     setSetData(data);
  //   };

  //   fetchSessiondata();
  // }, []);

  const openModal = () => {
    if (dialogRef.current) dialogRef.current.showModal();
  };

  const closeModal = () => {
    if (dialogRef.current) dialogRef.current.close();
  };

  const totalVolumeCombined = formattedSetData.reduce((acc, el) => {
    let aggTotalVol = 0;
    for (let i = 0; i < el.sets.length; i++) {
      aggTotalVol += el.sets[i].total_volume!;
    }
    acc[el.exerciseName] = { name: el.exerciseName, total_volume: aggTotalVol };
    return acc;
  }, {} as Record<string, number>);

  console.log("J", totalVolumeCombined);

  return (
    <div>
      <GoGraph className="insights-icon" onClick={openModal} />

      <dialog ref={dialogRef} className="insights-card">
        <div>
          <h2>Session Overview</h2>
          <span>chatGPT Input</span>
        </div>
        <h3>Insights</h3>

        {formattedSetData.map((exercise) => (
          <div>
            <h3>{exercise.exerciseName}</h3>
            <table>
              <thead>
                <tr>
                  <th>Sets</th>
                  <th>Total Volume</th>
                  <th>Adjusted Volume</th>
                </tr>
              </thead>
              <tbody>
                {exercise.sets.map((set) => (
                  <tr key={set.setNumber}>
                    <td>{set.setNumber}</td>
                    <td>
                      {set.total_volume}
                      <span className="weight-label">KG</span>
                    </td>
                    <td>sdsds</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        <span></span>
        <span></span>
        <h3>Recommendations</h3>
        <span></span>
        <button onClick={closeModal}>Close</button>
      </dialog>
    </div>
  );
};

export default InsightsModal;
