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

type FieldKey = "Reps" | "Weight";
type TouchedKey = `${FieldKey}Touched`;

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
          RepsTouched: boolean;
          WeightTouched: boolean;
        }
      >
    >((acc, el) => {
      acc[el.title] = {
        Reps: 0,
        Weight: 0,
        RepsTouched: false,
        WeightTouched: false,
      };
      return acc;
    }, {} as Record<string, { Reps: number; Weight: number; RepsTouched: boolean; WeightTouched: boolean }>);
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
        RepsTouched: false,
        WeightTouched: false,
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
    // setSetVals((prev) => ({
    //   ...prev,
    //   [set]: { ...prev[set],  `${field}+Touched`: true  },
    // });

    const touchedField = `${field}Touched`;

    setSetVals((prev) => ({
      ...prev,
      [set]: { ...prev[set], [touchedField]: true },
    }));
  };

  const handleValidation = (set: string, field: FieldKey) => {
    const touchedField = `${field}Touched` as TouchedKey;

    if (
      setVals[set][touchedField] &&
      (setVals[set][field] < 1 || isNaN(setVals[set][field]))
    ) {
      return true;
    }
  };

  const isSaveDisabed = () => {
    let field = "Reps" || ("Weight" as FieldKey);
    const valuesArr = Object.values(setVals);
    const targetValue = 0;
    const targetBoolean = false;

    const hasValue = valuesArr.some(
      (set) =>
        set.Reps === 0 ||
        set.Weight === 0 ||
        set.RepsTouched === false ||
        set.WeightTouched === false
    );

    return hasValue;
  };

  //TODO: the above works but now needs to be heavily refactored

  console.log("S", setVals);

  console.log(setVals);

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
      <button disabled={isSaveDisabed()} onClick={saveSets}>
        Save
      </button>
      <button onClick={() => isSaveDisabed()}>test</button>
      //TODO: need to add disable to save button until all validation has been
      met
    </div>
  );
};

export default AddSet;
