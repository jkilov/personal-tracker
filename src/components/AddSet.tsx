import { useState } from "react";

type NewSet = {
  id?: string;
  title?: string;
  repLabel: string;
  repInputType: string;
  weightLabel: string;
  weightInputType: string;
};

type SetValuesConfig = {
  el: NewSet;
  repVal: number;
  weightVal: number;
};

const newSetTemplate: NewSet = {
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

  const stateSetValues = createSet.reduce<any>((acc, el) => {
    acc[el.title] = { ...el, repVal: 0, weightVal: 0 };
    return acc;
  }, {});

  const [repData, setRepData] = useState(stateSetValues);

  const addSet = () => {
    const newCount = 1 + count;
    setCount(newCount);

    const title = `Set ${newCount}`;

    const newSet = {
      title,
      id: crypto.randomUUID(),
      ...newSetTemplate,
      ...stateSetValues[title],
    };
    setCreateSet((prev) => [...prev, newSet]);
  };

  const handleChange = (title: string, inputVal: string, value: string) => {
    setRepData((prev) => ({
      ...prev,
      [title]: { ...prev[title], [inputVal]: value },
    }));
  };

  console.log("D", repData);

  return (
    <div>
      {createSet.map((set) => (
        <div key={`${set.id}-${count}`}>
          <h4>{set.title}</h4>
          <label htmlFor={set.repLabel}>{set.repLabel}</label>
          <input
            type={set.repInputType}
            value={repData[set.title!].repVal}
            onChange={(e) => handleChange(set.title!, "repVal", e.target.value)}
          />
          <label htmlFor={set.weightLabel}>{set.weightLabel}</label>
          <input
            type={set.weightInputType}
            value={repData[set.title!].weightVal}
            onChange={(e) =>
              handleChange(set.title!, "weightVal", e.target.value)
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
