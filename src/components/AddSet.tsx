import { useState, useContext } from "react";
import { useNavigate, useParams } from "react-router";
import { createNewSet } from "../utils/supabase/set";
import { AuthContext } from "../App";
import "../App.css";

type MergeSet = {
  user_id: string | undefined;
  session_id: string | undefined;
  exercise_id: string;
  set_number: number;
  set_id: string | undefined;
  reps: number;
  weight: number;
};

type NewSet = {
  id?: string;
  setNo: number;
  title: string;
  repLabel: FieldKey;
  repInputType: string;
  weightLabel: FieldKey;
  weightInputType: string;
};

const newSetConfig: NewSet[] = [
  {
    id: crypto.randomUUID(),
    setNo: 1,
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
} as const;

interface Props {
  exerciseId: string;
}

type FieldKey = "Reps" | "Weight";

const AddSet = ({ exerciseId }: Props) => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [count, setCount] = useState(1);

  const [createSet, setCreateSet] = useState(newSetConfig);
  const session = useContext(AuthContext);

  const setValuesBuilder = (set: NewSet[]) => {
    return set.reduce<
      Record<
        string,
        {
          Reps: number;
          Weight: number;
          touched: Record<string, boolean>;
        }
      >
    >((acc, el) => {
      acc[el.title] = {
        Reps: 0,
        Weight: 0,
        touched: { Reps: false, Weight: false },
      };
      return acc;
    }, {} as Record<string, { Reps: number; Weight: number; touched: Record<string, boolean> }>);
  };

  const [setVals, setSetVals] = useState(() => setValuesBuilder(newSetConfig));

  const addSet = () => {
    const newCount = 1 + count;
    setCount(newCount);

    const title = `Set ${newCount}`;

    const newSet = {
      title,
      setNo: newCount,
      id: crypto.randomUUID(),
      ...addSetTemplate,
    };
    setCreateSet((prev) => [...prev, newSet]);
    setSetVals((prev) => ({
      ...prev,
      [title]: {
        Reps: 0,
        Weight: 0,
        touched: { Reps: false, Weight: false },
      },
    }));
  };

  const saveSets = async () => {
    const newArr = createSet.reduce<MergeSet[]>((acc, el) => {
      const mergeSet: MergeSet = {
        user_id: session?.user.id,
        session_id: sessionId,
        set_number: el.setNo,
        exercise_id: exerciseId,
        set_id: el.id,
        reps: setVals[el.title].Reps,
        weight: setVals[el.title].Weight,
      };
      acc.push(mergeSet);
      return acc;
    }, []);

    console.log("t", newArr);
    const { error } = await createNewSet(newArr);

    console.log(error);
  };

  const handleChange = (title: string, field: FieldKey, value: number) => {
    setSetVals((prev) => ({
      ...prev,
      [title]: { ...prev[title], [field]: value },
    }));
  };

  const handleBlur = (set: string, field: FieldKey) => {
    setSetVals((prev) => ({
      ...prev,
      [set]: { ...prev[set], touched: { ...prev[set].touched, [field]: true } },
    }));
  };

  const handleValidation = (set: string, field: FieldKey) => {
    if (
      setVals[set].touched[field] &&
      (setVals[set][field] < 1 || isNaN(setVals[set][field]))
    ) {
      return true;
    }
  };

  console.log("ss", setVals);
  console.log("L", createSet);
  return (
    <div>
      {createSet.map((set) => (
        <div key={set.id}>
          <h4>{set.title}</h4>
          <label htmlFor={set.repLabel}>{set.repLabel}</label>
          <input
            min={1}
            id={set.repLabel}
            type={set.repInputType}
            required
            value={setVals[set.title].Reps}
            onChange={(e) =>
              handleChange(set.title, set.repLabel, parseInt(e.target.value))
            }
            onBlur={() => handleBlur(set.title, "Reps")}
          />
          {handleValidation(set.title, set.repLabel) && (
            <span className="error-text">Value must be greater than 1</span>
          )}

          {/* //BUG: the above is not correct validation */}
          <label htmlFor={set.weightLabel}>{set.weightLabel}</label>
          <input
            min={1}
            id={set.weightLabel}
            required
            type={set.weightInputType}
            value={setVals[set.title].Weight}
            onChange={(e) =>
              handleChange(set.title, set.weightLabel, parseInt(e.target.value))
            }
            onBlur={() => handleBlur(set.title, "Weight")}
          />
          {handleValidation(set.title, set.weightLabel) && (
            <span className="error-text">Value must be greater than 1</span>
          )}
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
