import { useRef, useEffect, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import { type ExerciseData } from "../SessionModal/SessionModal";
import "./SelectExerciseModal.css";
import { supabase } from "../../utils/supabase/client-supabase";
import { IoIosArrowBack } from "react-icons/io";

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
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    if (isOpen && !modal.open) modal.showModal();
    if (!isOpen && modal.open) modal.close();
  }, [isOpen]);

  const handleExerciseSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value.toLowerCase();

    if (userInput.length < 2) setShapedExerciseData(exerciseData);
    const filteredSearch = exerciseData.filter((exercise) =>
      exercise.exercise_name.toLowerCase().includes(userInput.trim())
    );
    setShapedExerciseData(filteredSearch);
  };

  const moreExerciseInfo = (exerciseDetails: ExerciseData) => {
    setExerciseInfo(exerciseDetails);
    setIsImageLoaded(false);
  };

  const handleBack = () => {
    setExerciseInfo(null);
  };

  const url = exerciseInfo
    ? supabase.storage
        .from("exercise-images")
        .getPublicUrl(exerciseInfo?.media_url_ref).data.publicUrl
    : "";

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
    <dialog ref={modalRef} className="modal" onClose={onClose}>
      <div className="modal-container">
        <div className="modal-header">
          {exerciseInfo ? <IoIosArrowBack onClick={handleBack} /> : <div></div>}
          <h4>Find Exercise</h4>
          <IoCloseOutline onClick={onClose} />
        </div>
        <div
          className={
            exerciseInfo
              ? "exercise-block exercise-block-active "
              : "exercise-block"
          }
        >
          <div className="exercise-list">
            <input
              type="text"
              placeholder="Search for an exercise..."
              className="exercise-search"
              onChange={handleExerciseSearch}
            />

            <div className="select-exercise-list">
              {shapedExerciseData.map((exercise) => (
                <div key={exercise.exercise_id} className="exercise">
                  <p onClick={() => onSelectExercise(exercise.exercise_name)}>
                    {exercise.exercise_name}
                  </p>
                  <span>
                    <IoIosArrowForward
                      style={{ cursor: "pointer" }}
                      onClick={() => moreExerciseInfo(exercise)}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="exercise-info-container">
            {exerciseInfo && (
              <>
                {!isImageLoaded && <div className="exercise-img-skeleton" />}
                <img
                  key={url}
                  className={
                    isImageLoaded ? "exercise-img" : "exercise-img hidden"
                  }
                  src={url}
                  onLoad={handleImageLoad}
                  onError={handleImageLoad}
                />
              </>
            )}

            <div>
              <h4>{exerciseInfo?.exercise_name}</h4>
              <p>Muscle Group: {exerciseInfo?.body_part}</p>
              <p>Equipment: {exerciseInfo?.equipment}</p>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default SelectExerciseModal;
