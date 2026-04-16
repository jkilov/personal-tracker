import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"



dotenv.config()

const supabaseUrl = process.env.VITE_API_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
//removed service role key for testing



const supabase = createClient(supabaseUrl, supabaseServiceKey)

const testDeterminism = async() => {

    const sleeper = new Promise(resolve => {
        setTimeout(resolve, 2000)
    })

    const testData1 = {
        user_id: "7d2620a8-b770-44f4-b1e8-5d2a506942ac",
        session_id: "f93c594b-bdf6-4744-ac90-9154957ebf9a",
        exercise_id: "f59bf69d-ef30-478e-b3b0-e4d1fcef5d3b",
        reps: 20,
        weight: 100
    }

    const testData2 = {
        user_id: "7d2620a8-b770-44f4-b1e8-5d2a506942ac",
        session_id: "2d5bedf5-1c75-4d6d-ba89-0b8aa22fccf9",
        exercise_id: "c2aad793-e365-4215-ab32-e23b3b96b84d",
        reps: 20,
        weight: 100
    }

 await supabase.from("sets")
.insert(testData1)
.select()




await sleeper

const {data: scoresOne} = await supabase.from("fitness_scores")
.select("total_daily_volume, adjusted_daily_volume")
.eq("session_id", testData1.session_id)

const storedDataFirstRun = scoresOne

await supabase.from('fitness_scores')
    .delete()
    .eq('session_id', testData1.session_id)


await supabase.from("sets")
.insert(testData1)
.select()


await sleeper

const {data: scoresTwo} = await supabase.from("fitness_scores")
.select("total_daily_volume, adjusted_daily_volume")
.eq("session_id", testData1.session_id)

const storedDataSecondRun = scoresTwo

const isTotalDailyVolumeDeterministic = storedDataFirstRun[0].total_daily_volume === storedDataSecondRun[0].total_daily_volume
const isAdjustedDeterministic = storedDataFirstRun[0].adjusted_daily_volume === storedDataSecondRun[0].adjusted_daily_volume

console.log(isTotalDailyVolumeDeterministic && isAdjustedDeterministic ? "Passed Deterministic Test" : "Fails Deterministic Test" )

}

testDeterminism()