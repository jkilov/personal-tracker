import { useState } from "react";

type NewSet = {
  id: string;
  title?: string;
  repLabel: string;
  repInputType: string;
  weightLabel: string;
  weightInputType: string;
};

const newSetTemplate: NewSet = {
  id: crypto.randomUUID(),
  repLabel: "Reps",
  repInputType: "number",
  weightLabel: "Weight",
  weightInputType: "number",
};

const AddSet = () => {
  const [count, setCount] = useState(1);
  const [createSet, setCreateSet] = useState<NewSet[]>([
    {
      id: crypto.randomUUID(),
      title: `Set ${count}`,
      repLabel: "Reps",
      repInputType: "number",
      weightLabel: "Weight",
      weightInputType: "number",
    },
  ]);

  const addSet = () => {
    const newCount = 1 + count;
    setCount(newCount);

    const newSet = { title: `Set ${newCount}`, ...newSetTemplate };
    setCreateSet((prev) => [...prev, newSet]);
  };

  return (
    <div>
      {createSet.map((set) => (
        <div key={`${set.id}-${count}`}>
          <h4>{set.title}</h4>
          <label htmlFor={set.repLabel}>{set.repLabel}</label>
          <input type={set.repInputType} />
          <label htmlFor={set.weightLabel}>{set.weightLabel}</label>
          <input type={set.weightInputType} />
        </div>
      ))}
      <span>kg</span>
      <button onClick={addSet}>+</button>
    </div>
  );
};

export default AddSet;
