import { OrbitProgress } from "react-loading-indicators";
import { useGraphMetrics } from "../../components/InsightsGraphs/useGraphMetrics";

import { RadarChart, PolarGrid } from "recharts";
import LineGraph from "./LineGraph";
// import { RechartsDevtools } from '@recharts/devtools';

const InsightsGraphs = () => {
  const { data: rawTrainingData, error, isLoading } = useGraphMetrics();

  if (isLoading) {
    return <OrbitProgress color="#7CEA9C" size="medium" text="" textColor="" />;
  }

  console.log("R", rawTrainingData);

  return (
    <div style={{ width: "100vw" }}>
      <LineGraph rawTrainingData={rawTrainingData} />
      {/* <RadarChart
        style={{ width: "100%", aspectRatio: 1.618, maxWidth: "600px" }}
        outerRadius="80%"
        responsive
        data={formattedFitnessData}
      >
        <PolarGrid />
      </RadarChart> */}
    </div>
  );
};

export default InsightsGraphs;

//TODO: im trying to map over my data so it fits the line graph

// need to create a better shape for it that matches the line graph
