import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

const supabaseUrl = "https://sudaxmkqsdilkjylccqu.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1ZGF4bWtxc2RpbGtqeWxjY3F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMDM1MjcsImV4cCI6MjA4Njg3OTUyN30.pQbyTYDZXvQABPU7373JUayQKvceYN90NsXWHP4e3Rw"
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
await supabase.from("sets")
.insert(testData2)
.select()



await sleeper

const {data: scoresOne, error: errorOne} = await supabase.from("fitness_scores")
.select("total_daily_volume, adjusted_daily_volume")
.eq("session_id", testData1.session_id)

const {data:scoresTwo, error: errorTwo} = await supabase.from("fitness_scores")
.select("total_daily_volume, adjusted_daily_volume")
.eq("session_id",testData2.session_id)


console.log("data 1: ", scoresOne, "error: ", errorOne)
console.log("data 2: ", scoresTwo, "error: ", errorTwo)

console.log("Adjusted daily volume deterministic:", scoresOne[0].adjusted_daily_volume === scoresTwo[0].adjusted_daily_volume)
console.log("Adjusted daily volume deterministic:", scoresOne[0].total_daily_volume === scoresTwo[0].total_daily_volume)


    //end
}

testDeterminism()