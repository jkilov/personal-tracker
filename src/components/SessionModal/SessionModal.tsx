import { useState, useEffect, useRef } from "react";
import { readExerciseData } from "../../utils/supabase/exercise";
import AddSet from "../AddSet/AddSet";
import { RiCloseFill } from "react-icons/ri";

import "./SessionModal.css";

type ExerciseData = {
  exercise_id: string;
  exercise_name: string;
  body_part: string;
  media_url: string;
  equipment: string;
};

interface Props {
  handleOpenExerciseModal: (value: boolean) => void;
}

//TODO: need to create a type for what session data returns from readSet

const SessionModal = ({ handleOpenExerciseModal }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [exerciseData, setExerciseData] = useState<ExerciseData[] | null>([]);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseData | null>(
    null
  );

  const modalRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    let isMounted = true;

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

  const handleOpen = () => {
    if (modalRef) modalRef.current?.showModal();
    handleOpenExerciseModal(true);

    //TODO: we can refactor and derive state rather than creating a duplication
  };

  const handleClose = () => {
    if (modalRef) modalRef.current?.close();
    handleOpenExerciseModal(false);
  };

  if (isLoading) return <div>Loading.</div>;

  //FIXME: session date is being printed for every exercise despite being part of the same session

  //FIXME: change code here from getters and setters to commands and events
  //FIXME: remove booleans that arent actual and can be string unions (boo for booleans)
  return (
    <div>
      <button type="button" onClick={handleOpen}>
        Add Exercise
      </button>
      <dialog ref={modalRef} className="session-card">
        <div>
          <RiCloseFill onClick={handleClose} />

          <h3>Add Workout</h3>
          <div className="exercise-select-container">
            <label htmlFor="exerciseList">Select Exercise</label>
            <select
              className="exercise-selector"
              value=""
              name="exerciseList"
              id="exerciseList"
              onChange={(e) => handleExerciseSelection(e.target.value)}
            >
              <option value="" disabled selected></option>
              {exerciseData?.map((exercise) => (
                <option
                  id={exercise.exercise_id}
                  value={exercise.exercise_name}
                  key={exercise.exercise_id}
                  data-user-exercise="test" //need to fix
                >
                  {exercise.exercise_name}
                </option>
              ))}
            </select>
          </div>
          {selectedExercise && (
            <div>
              <AddSet
                exerciseId={selectedExercise.exercise_id}
                handleClose={handleClose}
              />
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
};

export default SessionModal;
