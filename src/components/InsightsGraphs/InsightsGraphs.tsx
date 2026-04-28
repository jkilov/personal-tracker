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

type SessionDate = {
  session_date: string;
};

type FormattedFitnessData = {
  Date: string;
  total_daily_volume: number;
  adjusted_daily_volume: number;
  session: SessionDate[];
};

const InsightsGraphs = () => {
  const { data, error, isLoading } = useGraphMetrics();
  const [formattedFitnessData, setFormattedFitnessData] = useState<
    FormattedFitnessData[]
  >([]);
  useEffect(() => {
    const formattedData = data.map((el) => ({
      Date: el.session.session_date,
      total_daily_volume: el.total_daily_volume,
      adjusted_daily_volume: el.adjusted_daily_volume,
    }));

    formattedData.sort(
      (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime()
    );

    setFormattedFitnessData(formattedData);
  }, [data]);

  if (isLoading) {
    return <OrbitProgress color="#7CEA9C" size="medium" text="" textColor="" />;
  }

  console.log("data", data);
  console.log("t", formattedFitnessData);

  return (
    <div style={{ width: "100vw" }}>
      <LineChart
        style={{ width: "100%", aspectRatio: 1.618, maxWidth: 600 }}
        responsive
        data={formattedFitnessData}
        margin={{
          top: 20,
          right: 20,
          bottom: 5,
          left: 0,
        }}
      >
        <CartesianGrid stroke="var(--font)" strokeDasharray="5" />
        <Line
          dataKey="adjusted_daily_volume"
          type="monotone"
          strokeWidth={3}
          name="Adjusted Daily Volume"
          stroke="#7494EA"
          dot={{ fill: "var(--background)" }}
        />
        <Line
          dataKey="total_daily_volume"
          type="monotone"
          strokeWidth={3}
          name="Total Daily Volume"
          stroke="#7CEA9C"
          dot={{ fill: "var(--background)" }}
        />
        <XAxis dataKey="Date" />
        <YAxis
          width="auto"
          label={{ value: "KG", position: "insideLeft", angle: -90 }}
        />
        <Legend align="center" />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--background)",
          }}
        />
      </LineChart>
    </div>
  );
};

export default InsightsGraphs;

//TODO: im trying to map over my data so it fits the line graph

// need to create a better shape for it that matches the line graph
