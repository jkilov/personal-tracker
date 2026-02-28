import { useState } from "react";
import { useNavigate } from "react-router";

type NewSet = {
  id?: string;
  title: string;
  repLabel: string;
  repInputType: string;
  weightLabel: string;
  weightInputType: string;
};

type RepValuesConfig = {
  el: NewSet;
  repVal: number;
  weightVal: number;
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

const AddSet = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(1);
  const [createSet, setCreateSet] = useState(newSetConfig);

  // const repValueConfig = createSet.reduce<any>((acc, el) => {
  //   acc[el.title] = {
  //     repValue: 0,
  //     weightValue: 0,
  //   };
  //   return acc;
  // }, {});

  const addSetTemplate = {
    repLabel: "Reps",
    repInputType: "number",
    weightLabel: "Weight",
    weightInputType: "number",
  };

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

  const testChange = (title: string, input: string, value: number) => {
    setSetVals((prev) => ({
      ...prev,
      [title]: { ...prev[title], [input]: value },
    }));
  };

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
      <button>Save</button>
    </div>
  );
};

export default AddSet;
