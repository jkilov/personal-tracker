import { useState, useEffect } from "react";
import { type FetchedTrainingData } from "./useGraphMetrics";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

interface Props {
  rawTrainingData: FetchedTrainingData[];
}

type RadarGraphDataShope = {
  body_part: string;
  count: number;
};

export const RadarGraph = ({ rawTrainingData }: Props) => {
  // const [formattedFitnessData, setFormattedFitnessData] = useState<
  //   RadarGraphDataShope[]
  // >([]);

  // useEffect(() => {
  //   const fitnessDataObj = rawTrainingData.reduce((acc, el) => {
  //     const setLength = el.session.sets;

  //     for (let i = 0; i < setLength.length; i++) {
  //       const bodyPart = el.session.sets[i].exercise.body_part;

  //       acc[bodyPart] = (acc[bodyPart] || 0) + 1;
  //     }

  //     return acc;
  //   }, {});

  //   const fitnessDataArr = Object.entries(fitnessDataObj).map(
  //     ([body_part, count]) => ({
  //       body_part,
  //       count,
  //     })
  //   )<RadarGraphDataShope[]>;

  //   setFormattedFitnessData(fitnessDataArr);
  // }, [rawTrainingData]);

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
    <div>
      <RadarChart
        style={{ width: "100%", aspectRatio: 1.618, maxWidth: "600px" }}
        outerRadius="80%"
        responsive
        data={fitnessDataArr}
      >
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
    </div>
  );
};

//question: when do we decide to do logic on the frontend or on the backend - surely ther above data transofrmation can be done on the backend in supabase?
