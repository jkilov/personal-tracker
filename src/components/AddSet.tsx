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

  const repValueConfig = createSet.reduce<any>((acc, el) => {
    acc[el.title] = {
      ...el,
      id: crypto.randomUUID(),
      repValue: 0,
      weightValue: 0,
    };
    return acc;
  }, {});

  const addSetTemplate = {
    repLabel: "Reps",
    repInputType: "number",
    weightLabel: "Weight",
    weightInputType: "number",
  };
  // const [createSet, setCreateSet] = useState<NewSet[]>([
  //   {
  //     id: crypto.randomUUID(),
  //     title: `Set ${count}`,
  //     repLabel: "Reps",
  //     repInputType: "number",
  //     weightLabel: "Weight",
  //     weightInputType: "number",
  //   },
  // ]);

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
  };

  console.log("count", count);
  console.log("createSet", createSet);
  console.log("repValuesConfig", repValueConfig);
  return (
    <div>
      {createSet.map((set) => (
        <div key={`${set.id}-${count}`}>
          <h4>{set.title}</h4>
          <label htmlFor={set.repLabel}>{set.repLabel}</label>
          <input
            type={set.repInputType}
            value={repValueConfig[set.title].repValue}
          />
          <label htmlFor={set.weightLabel}>{set.weightLabel}</label>
          <input
            type={set.weightInputType}
            value={repValueConfig[set.title].weightValue}
          />
        </div>
      ))}
      <span>kg</span>
      <button onClick={addSet}>+</button>
    </div>
  );
};

export default AddSet;
