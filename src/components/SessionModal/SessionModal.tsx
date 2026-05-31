import { useState, useEffect } from "react";
import { readExerciseData } from "../../utils/supabase/exercise";
import AddSet from "../AddSet/AddSet";

import "./SessionModal.css";
import SelectExerciseModal from "../SelectExerciseModal/SelectExerciseModal";

export type ExerciseData = {
  exercise_id: string;
  exercise_name: string;
  body_part: string;
  media_url_ref: string;
  equipment: string;
};

//TODO: need to create a type for what session data returns from readSet

interface Props {
  onSave: () => void;
}
const SessionModal = ({ onSave }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [exerciseData, setExerciseData] = useState<ExerciseData[] | null>([]);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseData | null>(
    null
  );
  const [isSelectExerciseModalOpen, setIsSelectExerciseModalOpen] =
    useState(false);

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

    if (selectedExerciseData) setSelectedExercise(selectedExerciseData);
    setIsSelectExerciseModalOpen(false);
    return;
  };

  const handleOpenSelectExerciseModal = () => {
    setIsSelectExerciseModalOpen(true);
  };

  const handleCloseSelectExerciseModal = () => {
    setIsSelectExerciseModalOpen(false);
  };

  if (isLoading) return <div>Loading.</div>;

  //FIXME: change code here from getters and setters to commands and events
  //FIXME: remove booleans that arent actual and can be string unions (boo for booleans)

  return (
    <div className="session-card">
      <div>
        <h2>Add Workout</h2>
        <div className="exercise-select-container">
          <label htmlFor="exerciseList">Select Exercise</label>
          {/* <select
            className="exercise-selector"
            value={selectedExercise?.exercise_name ?? ""}
            name="exerciseList"
            id="exerciseList"
            onChange={(e) => handleExerciseSelection(e.target.value)}
          >
            <option value="" disabled></option>
            {exerciseData?.map((exercise) => (
              <option
                id={exercise.exercise_id}
                value={exercise.exercise_name}
                key={exercise.exercise_id}
                data-user-exercise="test" //need to fix
              >
                {exercise.exercise_name}
                <span>
                  <IoIosArrowForward />
                </span>
              </option>
            ))}
          </select> */}
          <div>
            <button type="button" onClick={handleOpenSelectExerciseModal}>
              Select Exercise
            </button>
            <SelectExerciseModal
              isOpen={isSelectExerciseModalOpen}
              onClose={handleCloseSelectExerciseModal}
              exerciseData={exerciseData ?? []}
              onSelectExercise={handleExerciseSelection}
            />
          </div>
        </div>
        {selectedExercise && (
          <div>
            <AddSet
              onSave={onSave}
              exerciseId={selectedExercise.exercise_id}
              onReset={() => setSelectedExercise(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionModal;
