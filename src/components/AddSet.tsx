import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { createNewSet } from "../utils/supabase/set";

type MergeSet = {
  session_id: string | undefined;
  exercise_id: string;

  set_id: string | undefined;
  reps: number;
  weight: number;
};

type NewSet = {
  id?: string;
  title: string;
  repLabel: string;
  repInputType: string;
  weightLabel: string;
  weightInputType: string;
};

const newSetConfig: NewSet[] = [
  {
    id: crypto.randomUUID(),
    title: "Set 1",
    repLabel: "Reps",
    repInputType: "number",
    weightLabel: "Weight",
    weightInputType: "number",
  },
];

const addSetTemplate = {
  repLabel: "Reps",
  repInputType: "number",
  weightLabel: "Weight",
  weightInputType: "number",
};

interface Props {
  exerciseId: string;
}

const AddSet = ({ exerciseId }: Props) => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [count, setCount] = useState(1);
  const [createSet, setCreateSet] = useState(newSetConfig);

  const setValuesBuilder = (set: NewSet[]) => {
    return set.reduce<
      Record<string, { repValue: number; weightValue: number }>
    >((acc, el) => {
      acc[el.title] = { repValue: 0, weightValue: 0 };
      return acc;
    }, {} as Record<string, { repValue: number; weightValue: number }>);
  };

  const [setVals, setSetVals] = useState(() => setValuesBuilder(newSetConfig));

  const addSet = () => {
    const newCount = 1 + count;
    setCount(newCount);

    const title = `Set ${newCount}`;

    const newSet = {
      title,
      id: crypto.randomUUID(),
      ...addSetTemplate,
    };
    setCreateSet((prev) => [...prev, newSet]);
    setSetVals((prev) => ({
      ...prev,
      [title]: { repValue: 0, weightValue: 0 },
    }));
  };

  const saveSets = async () => {
    const newArr = createSet.reduce<MergeSet[]>((acc, el) => {
      const mergeSet: MergeSet = {
        session_id: sessionId,
        exercise_id: exerciseId,
        set_id: el.id,
        reps: setVals[el.title].repValue,
        weight: setVals[el.title].weightValue,
      };
      acc.push(mergeSet);
      return acc;
    }, []);

    console.log(newArr);
    const { data, error } = await createNewSet(newArr);

    console.log(error);
  };

  const testChange = (title: string, input: string, value: number) => {
    setSetVals((prev) => ({
      ...prev,
      [title]: { ...prev[title], [input]: value },
    }));
  };

  console.log([setVals]);

  return (
    <div>
      {createSet.map((set) => (
        <div key={set.id}>
          <h4>{set.title}</h4>
          <label htmlFor={set.repLabel}>{set.repLabel}</label>
          <input
            type={set.repInputType}
            value={setVals[set.title].repValue}
            onChange={(e) =>
              testChange(set.title, "repValue", parseInt(e.target.value))
            }
          />

          <label htmlFor={set.weightLabel}>{set.weightLabel}</label>
          <input
            type={set.weightInputType}
            value={setVals[set.title].weightValue}
            onChange={(e) =>
              testChange(set.title, "weightValue", parseInt(e.target.value))
            }
          />
        </div>
      ))}
      <span>kg</span>
      <button onClick={addSet}>+</button>
      <button
        onClick={() => {
          navigate(-1);
        }}
      >
        cancel
      </button>
      <button onClick={saveSets}>Save</button>
    </div>
  );
};

export default AddSet;
