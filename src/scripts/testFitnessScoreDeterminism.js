// Manual verification probe for the deterministic scoring trigger.
//
// Inserts the same set data twice (deleting the derived fitness_scores row in
// between) and compares the recalculated scores. Requires a database where the
// trigger exists, plus env vars pointing at real rows:
//   VITE_API_URL           - Supabase project URL
//   SUPABASE_SERVICE_KEY   - service-role key (bypasses RLS; operator use only)
//   TEST_USER_ID           - existing user id to attribute the test set to
//   TEST_SESSION_ID        - existing session id to insert the test set into
//   TEST_EXERCISE_ID       - existing exercise id for the test set
//
// NOTE: this writes to and deletes from the target database. Do not point it
// at data you care about. Exits non-zero on failure so it can gate automation.

import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const requiredEnv = [
    "VITE_API_URL",
    "SUPABASE_SERVICE_KEY",
    "TEST_USER_ID",
    "TEST_SESSION_ID",
    "TEST_EXERCISE_ID",
]

const missing = requiredEnv.filter((name) => !process.env[name])

if (missing.length > 0) {
    console.error(`Missing required env vars: ${missing.join(", ")}`)
    process.exit(1)
}

const supabase = createClient(process.env.VITE_API_URL, process.env.SUPABASE_SERVICE_KEY)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const testDeterminism = async () => {

    const testData = {
        user_id: process.env.TEST_USER_ID,
        session_id: process.env.TEST_SESSION_ID,
        exercise_id: process.env.TEST_EXERCISE_ID,
        reps: 20,
        weight: 100,
    }

    const readScores = async () => {
        const { data, error } = await supabase.from("fitness_scores")
            .select("total_daily_volume, adjusted_daily_volume")
            .eq("session_id", testData.session_id)

        if (error || !data || data.length === 0) {
            console.error("Failed to read fitness_scores:", error?.message ?? "no rows returned")
            process.exit(1)
        }

        return data[0]
    }

    const insertSet = async () => {
        const { error } = await supabase.from("sets").insert(testData).select()

        if (error) {
            console.error("Failed to insert test set:", error.message)
            process.exit(1)
        }
    }

    await insertSet()
    await sleep(2000) // allow the trigger to recalculate
    const firstRun = await readScores()

    await supabase.from("fitness_scores")
        .delete()
        .eq("session_id", testData.session_id)

    await insertSet()
    await sleep(2000) // allow the trigger to recalculate
    const secondRun = await readScores()

    const isDeterministic =
        firstRun.total_daily_volume === secondRun.total_daily_volume &&
        firstRun.adjusted_daily_volume === secondRun.adjusted_daily_volume

    if (!isDeterministic) {
        console.error("Fails Deterministic Test", { firstRun, secondRun })
        process.exit(1)
    }

    console.log("Passed Deterministic Test")
}

testDeterminism()
