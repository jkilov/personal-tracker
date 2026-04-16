import { supabase } from "./client-supabase";


export type FitnessScores = {
    adjusted_daily_volume: number;
    total_daily_volume: number
    session_Id: string;
}

export const getFitnessScoresBySession = async(sessionId: string) => {

    const {data, error} = await supabase.from("fitness_scores")
    .select()
    .eq("session_id", `${sessionId}`)
    .single()

    return {data, error}
}