import { useRef, useEffect, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import { type ExerciseData } from "../SessionModal/SessionModal";
import "./ SelectExerciseModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exerciseData: ExerciseData[];
  onSelectExercise: (selectedExercise: string) => void;
}

const SelectExerciseModal = ({
  isOpen,
  onClose,
  exerciseData,
  onSelectExercise,
}: Props) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [shapedExerciseData, setShapedExerciseData] = useState(exerciseData);
  const [exerciseInfo, setExerciseInfo] = useState<ExerciseData | null>(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    if (isOpen && !modal.open) modal.showModal();
    if (!isOpen && modal.open) modal.close();
  }, [isOpen]);

  const handleExerciseSearch = (e: any) => {
    const userInput = e.target.value.toLowerCase();

    if (userInput.length < 2) setShapedExerciseData(exerciseData);
    const filteredSearch = exerciseData.filter((exercise) =>
      exercise.exercise_name.toLowerCase().includes(userInput.trim())
    );
    setShapedExerciseData(filteredSearch);
    console.log("F", filteredSearch);
  };

  const moreExerciseInfo = (exerciseDetails: ExerciseData) => {
    setExerciseInfo(exerciseDetails);
  };

  //TODO: refactor the above - also the modal keeps changing size CLS is happening (cumulative layout shift)
  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-container">
        <div className="modal-header">
          <div></div>
          <h4>Find Exercise</h4>
          <IoCloseOutline onClick={onClose} />
        </div>
        <div className="exercise-list">
          <input
            type="text"
            placeholder="Search for an exercise..."
            className="exercise-search"
            onChange={handleExerciseSearch}
          />
          {shapedExerciseData.map((exercise) => (
            <div key={exercise.exercise_id} className="exercise">
              <p onClick={() => onSelectExercise(exercise.exercise_name)}>
                {exercise.exercise_name}
              </p>
              <span>
                <IoIosArrowForward onClick={() => moreExerciseInfo(exercise)} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </dialog>
  );
};

export default SelectExerciseModal;
