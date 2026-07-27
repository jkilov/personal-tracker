import { type FetchedTrainingData } from "./useGraphMetrics";
import "./GraphContainer.css";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface Props {
  rawTrainingData: FetchedTrainingData[];
}

export const RadarGraph = ({ rawTrainingData }: Props) => {
  const fitnessDataObj = rawTrainingData.reduce<Record<string, number>>(
    (acc, el) => {
      const setLength = el.session.sets;

      for (let i = 0; i < setLength.length; i++) {
        const bodyPart = el.session.sets[i].exercise.body_part;

        acc[bodyPart] = (acc[bodyPart] || 0) + 1;
      }

      return acc;
    },
    {}
  );

  const fitnessDataArr = Object.entries(fitnessDataObj).map(
    ([body_part, count]) => ({
      body_part,
      count,
    })
  );

  return (
    <div className="graph">
      <h4>Most Frequently trained Body Part</h4>
      <ResponsiveContainer width="100%" aspect={1.618}>
        <RadarChart outerRadius="80%" data={fitnessDataArr}>
          <PolarGrid />
          <PolarAngleAxis dataKey="body_part" />
          <PolarRadiusAxis />
          <Radar
            name="Most frequent body parts"
            dataKey="count"
            stroke="#7494EA"
            fill="#7494EA"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
