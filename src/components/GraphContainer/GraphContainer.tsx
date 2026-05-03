import { OrbitProgress } from "react-loading-indicators";
import { useGraphMetrics } from "./useGraphMetrics";
import LineGraph from "./LineGraph";
import { RadarGraph } from "./RadarGraph";
import "./GraphContainer.css";
import BarGraph from "./BarGraph";

const InsightsGraphs = () => {
  const { data: rawTrainingData, error, isLoading } = useGraphMetrics();

  if (isLoading) {
    return <OrbitProgress color="#7CEA9C" size="medium" text="" textColor="" />;
  }

  // if (error) {
  //   return <span>An error occurred. Please Refresh the page</span>;
  // }

  return (
    <div className="graph-container">
      <LineGraph rawTrainingData={rawTrainingData} />
      <RadarGraph rawTrainingData={rawTrainingData} />
      <BarGraph rawTrainingData={rawTrainingData} />
    </div>
  );
};

export default InsightsGraphs;
