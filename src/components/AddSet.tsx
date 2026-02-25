import { useState } from "react";

type NewSet = {
  id: string;
  title: string;
  repLabel: string;
  repInputType: string;
  weightLabel: string;
  weightInputType: string;
};

const newSetTemplat: NewSet = {
  id: crypto.randomUUID(),
  title: "Set",
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

  return (
    <div>
      {createSet.map((set) => (
        <div key={set.id}>
          <h4>{set.title}</h4>
          <label htmlFor={set.repLabel}>{set.repLabel}</label>
          <input type={set.repInputType} />
          <label htmlFor={set.weightLabel}>{set.weightLabel}</label>
          <input type={set.weightInputType} />
        </div>
      ))}
      <span>kg</span>
      <button>+</button>
    </div>
  );
};

export default AddSet;
