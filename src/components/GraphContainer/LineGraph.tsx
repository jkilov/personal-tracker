import { useState, useEffect } from "react";
import { type FetchedTrainingData } from "./useGraphMetrics";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  rawTrainingData: FetchedTrainingData[];
}

type LineGraphDataShape = {
  date: string;
  total_daily_volume: number;
  adjusted_daily_volume: number;
};

const LineGraph = ({ rawTrainingData }: Props) => {
  const [formattedFitnessData, setFormattedFitnessData] = useState<
    LineGraphDataShape[]
  >([]);

  useEffect(() => {
    const formattedData = rawTrainingData.map((el) => ({
      date: el.session.session_date,
      total_daily_volume: el.total_daily_volume,
      adjusted_daily_volume: el.adjusted_daily_volume,
    }));

    formattedData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setFormattedFitnessData(formattedData);
  }, [rawTrainingData]);
  return (
    <div>
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
        <XAxis dataKey="date" />
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

export default LineGraph;
