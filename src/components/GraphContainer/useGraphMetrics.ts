import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase/client-supabase";

type Exercise = {
  body_part: string;
  exercise_name: string;
}

type Sets = {
  exercise_id: string;
  exercise: Exercise
}

type Session = {
  session_date: string;
  sets: Sets[]
}

export type FetchedTrainingData = {
  total_daily_volume: number;
  adjusted_daily_volume: number;
  session: Session
}

export const useGraphMetrics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<FetchedTrainingData[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data: fitnessScoreData, error: fitnessScoreError } =
          await supabase.from("fitness_scores").select(`
                    total_daily_volume,
                    adjusted_daily_volume,
                    session!inner(session_date,
                    sets!inner(exercise_id,
                    exercise!inner(exercise_name, body_part
                    )
                    )
                    )
                    `);
        
        if (cancelled) return;
        if (fitnessScoreError)
          throw new Error("Failed to fetch fitness scores", {
            cause: fitnessScoreError,
          });
        setData(fitnessScoreData);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

 
  return { data, error, isLoading };
};
