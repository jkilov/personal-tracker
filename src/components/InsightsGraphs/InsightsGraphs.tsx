import { OrbitProgress } from "react-loading-indicators";
import {
  type FetchedFitnessScores,
  useGraphMetrics,
} from "../../components/InsightsGraphs/useGraphMetrics";
import { useState, useEffect } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
// import { RechartsDevtools } from '@recharts/devtools';

type FormattedFitnessData = {
  date: string;
  total_Daily_volume: number;
  adjusted_daily_volume: number;
};

const InsightsGraphs = () => {
  const { data, error, isLoading } = useGraphMetrics();
  const [formattedFitnessData, setFormattedFitnessData] = useState<
    FormattedFitnessData[]
  >([]);
  useEffect(() => {
    setFormattedFitnessData(
      data.map((el) => ({
        date: el.session.session_date,
        total_daily_volume: el.total_daily_volume,
        adjusted_daily_volume: el.adjusted_daily_volume,
      }))
    );
  }, [data]);

  if (isLoading) {
    return <OrbitProgress color="#7CEA9C" size="medium" text="" textColor="" />;
  }

  return (
    <div>
      <LineChart
        style={{ width: "100%", aspectRatio: 1.7, maxWidth: 600 }}
        responsive
        data={data}
      >
        {formattedFitnessData.map((element) => (
          <Line key={element.date} dataKey={element.adjusted_daily_volume} />
          // <RechartsDevtools />
        ))}
      </LineChart>
    </div>
  );
};

export default InsightsGraphs;

//TODO: im trying to map over my data so it fits the line graph

// need to create a better shape for it that matches the line graph
