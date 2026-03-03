import { useState, useContext } from "react";
import { useNavigate, useParams } from "react-router";
import { createNewSet } from "../utils/supabase/set";
import { AuthContext } from "../App";

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
  repLabel: string;
  repInputType: string;
  weightLabel: string;
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
};

interface Props {
  exerciseId: string;
}

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
          repValue: number;
          weightValue: number;
          touched: Record<string, boolean>;
        }
      >
    >((acc, el) => {
      acc[el.title] = {
        repValue: 0,
        weightValue: 0,
        touched: { Reps: false, Weight: false },
      };
      return acc;
    }, {} as Record<string, { repValue: number; weightValue: number; touched: Record<string, boolean> }>);
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
        repValue: 0,
        weightValue: 0,
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
        reps: setVals[el.title].repValue,
        weight: setVals[el.title].weightValue,
      };
      acc.push(mergeSet);
      return acc;
    }, []);

    console.log("t", newArr);
    const { error } = await createNewSet(newArr);

    console.log(error);
  };

  const handleChange = (title: string, input: string, value: number) => {
    setSetVals((prev) => ({
      ...prev,
      [title]: { ...prev[title], [input]: value },
    }));
  };

  const handleBlur = (set: string, input: string) => {
    setSetVals((prev) => ({
      ...prev,
      [set]: { ...prev[set], touched: { ...prev[set].touched, [input]: true } },
    }));
  };

  const handleValidation = (set: string, input: string, value: string) => {
    if (setVals[set].touched[input] && setVals[set][value] < 1) {
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
            value={setVals[set.title].repValue}
            onChange={(e) =>
              handleChange(set.title, "repValue", parseInt(e.target.value))
            }
            onBlur={() => handleBlur(set.title, set.repLabel)}
          />
          {handleValidation(set.title, set.repLabel, "repValue") && (
            <span>Value must be greater than 1</span>
          )}

          {/* //BUG: the above is not correct validation */}
          <label htmlFor={set.weightLabel}>{set.weightLabel}</label>
          <input
            id={set.weightLabel}
            required
            type={set.weightInputType}
            value={setVals[set.title].weightValue}
            onChange={(e) =>
              handleChange(set.title, "weightValue", parseInt(e.target.value))
            }
            onBlur={() => handleBlur(set.title, set.weightLabel)}
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
