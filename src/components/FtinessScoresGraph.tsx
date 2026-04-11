import { RadialBarChart, RadialBar, Legend, Tooltip } from "recharts";

const FtinessScoresGraph = () => {
  const data = [
    {
      name: "Adjusted Total Volume",
      uv: 31.47,
      pv: 2400,
      fill: "#8884d8",
    },
    {
      name: "Total Volume",
      uv: 26.69,
      pv: 4567,
      fill: "#83a6ed",
    },
  ];

  const style = {
    top: "50%",
    right: 0,
    transform: "translate(0, -50%)",
    lineHeight: "24px",
  };

  return (
    <RadialBarChart
      style={{
        width: "100%",
        maxWidth: "700px",
        maxHeight: "80vh",
        aspectRatio: 1.618,
      }}
      responsive
      cx="30%"
      barSize={14}
      data={data}
    >
      <RadialBar
        label={{ position: "insideStart", fill: "#fff" }}
        background
        dataKey="uv"
      />
      <Legend
        iconSize={10}
        layout="vertical"
        verticalAlign="middle"
        wrapperStyle={style}
      />
      <Tooltip />
    </RadialBarChart>
  );
};

export default FtinessScoresGraph;
