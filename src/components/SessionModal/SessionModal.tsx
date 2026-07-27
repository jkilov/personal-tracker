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
        const { data, error } = await readExerciseData();
        if (error) console.error("Error loading exercises: ", error.message);
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

  return (
    <div className="session-card">
      <div>
        <h2>Add Workout</h2>
        <div className="exercise-select-container">
          <div>
            <button type="button" onClick={handleOpenSelectExerciseModal}>
              Select Exercise
            </button>
            {selectedExercise && (
              <p className="selected-exercise-name">
                Selected: <strong>{selectedExercise.exercise_name}</strong>
              </p>
            )}
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
              key={selectedExercise.exercise_id}
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
