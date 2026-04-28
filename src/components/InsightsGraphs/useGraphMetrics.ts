import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase/client-supabase";

type SessionDate = {
  session_date: string;
};

export type FetchedFitnessScores = {
  total_daily_volume: number;
  adjusted_daily_volume: number;
  session: SessionDate[];
};

export const useGraphMetrics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<FetchedFitnessScores[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data: fitnessScoreData, error: fitnessScoreError } =
          await supabase.from("fitness_scores").select(`
                    total_daily_volume,
                    adjusted_daily_volume,
                    session!inner(session_date)
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
