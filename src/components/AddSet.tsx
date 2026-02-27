import { useState } from "react";

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

  const [setVals, setSetVals] = useState(() =>
    newSetConfig.reduce<
      Record<string, { repValue: number; weightValue: number }>
    >((acc, el) => {
      acc[el.title] = { repValue: 0, weightValue: 0 };
      return acc;
    }, {} as Record<string, { repValue: number; weightValue: number }>)
  );

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

  console.log("count", count);
  console.log("createSet", createSet);

  console.log("setVals", setVals);
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
    </div>
  );
};

export default AddSet;
