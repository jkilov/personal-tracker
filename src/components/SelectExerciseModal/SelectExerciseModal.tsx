import { useRef, useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import { type ExerciseData } from "../SessionModal/SessionModal";
import "./ SelectExerciseModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exerciseData: ExerciseData[];
}

const SelectExerciseModal = ({ isOpen, onClose, exerciseData }: Props) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    if (isOpen && !modal.open) modal.showModal();
    if (!isOpen && modal.open) modal.close();
  }, [isOpen]);

  const handleExerciseSearch = (e: any) => {
    const userInput = e.target.value;
    if (userInput.length < 2) return exerciseData;
    const filteredSearch = exerciseData.filter(
      (exercise) => exercise.exercise_name === userInput
    );
    console.log("F", filteredSearch);
  };

  //FIXME: need to get the above working - the filter is not working.

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
          {exerciseData.map((exercise) => (
            <div
              className="exercise"
              onClick={() => console.log(exercise.exercise_id)}
            >
              <p>{exercise.exercise_name}</p>
              <span>
                <IoIosArrowForward />
              </span>
            </div>
          ))}
        </div>
      </div>
    </dialog>
  );
};

export default SelectExerciseModal;
