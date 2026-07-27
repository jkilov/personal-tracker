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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [exerciseInfo, setExerciseInfo] = useState<ExerciseData | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    if (isOpen && !modal.open) {
      modal.showModal();
      searchInputRef.current?.focus();
    }
    if (!isOpen && modal.open) modal.close();
  }, [isOpen]);

  // Derived during render from the prop — no state snapshot to go stale.
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredExercises = normalizedSearch
    ? exerciseData.filter((exercise) =>
        exercise.exercise_name.toLowerCase().includes(normalizedSearch)
      )
    : exerciseData;

  // Fires on Escape, on close(), and via the close button — resets the
  // modal's local state so reopening starts from a clean list.
  const handleDialogClose = () => {
    setSearchTerm("");
    setExerciseInfo(null);
    onClose();
  };

  const moreExerciseInfo = (exerciseDetails: ExerciseData) => {
    setExerciseInfo(exerciseDetails);
    setIsImageLoaded(false);
  };

  const handleBack = () => {
    setExerciseInfo(null);
  };

  const url = exerciseInfo?.media_url_ref
    ? supabase.storage
        .from("exercise-images")
        .getPublicUrl(exerciseInfo.media_url_ref).data.publicUrl
    : "";

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
    <dialog ref={modalRef} className="modal" onClose={handleDialogClose}>
      <div className="modal-container">
        <div className="modal-header">
          {exerciseInfo ? (
            <button
              type="button"
              className="icon-btn"
              aria-label="Back to exercise list"
              onClick={handleBack}
            >
              <IoIosArrowBack />
            </button>
          ) : (
            <div></div>
          )}
          <h4>Find Exercise</h4>
          <button
            type="button"
            className="icon-btn"
            aria-label="Close"
            onClick={handleDialogClose}
          >
            <IoCloseOutline />
          </button>
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
              ref={searchInputRef}
              type="text"
              placeholder="Search for an exercise..."
              className="exercise-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="select-exercise-list">
              {filteredExercises.map((exercise) => (
                <div key={exercise.exercise_id} className="exercise">
                  <button
                    type="button"
                    className="icon-btn exercise-name-btn"
                    onClick={() => onSelectExercise(exercise.exercise_name)}
                  >
                    {exercise.exercise_name}
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`View details for ${exercise.exercise_name}`}
                    onClick={() => moreExerciseInfo(exercise)}
                  >
                    <IoIosArrowForward />
                  </button>
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
                  alt={`${exerciseInfo.exercise_name} demonstration`}
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
