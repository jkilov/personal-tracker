import { supabase } from "./client-supabase";


export type FitnessScores = {
    adjusted_daily_volume: number;
    total_daily_volume: number
    session_Id: string;
}

export const getFitnessScoresBySession = async(sessionId: string) => {


    try {

        const {data, error} = await supabase
        .from("fitness_scores")
        .select('*')
        .eq("session_id", sessionId)
        .single()

        if (error) {
            console.error(error.cause, error.message, error.details)
            throw new Error(`error occurred when writing information: ${error.message}, ${error.cause}`)
        }


        return {data, error: null}
        
    } catch (error) {

        console.error(error)
        return {data: null, error}
        
    }



}