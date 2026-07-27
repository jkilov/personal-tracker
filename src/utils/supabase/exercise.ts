import {supabase} from "./client-supabase"


//READ

// Supabase caps a single select at 1000 rows; the exercise catalog is larger,
// so fetch in ordered pages until a page comes back short.
const PAGE_SIZE = 1000

export const readExerciseData = async() => {
  const allRows = []
  let from = 0

  while (true) {
    const {data, error} = await supabase
      .from("exercise")
      .select()
      .order("exercise_name")
      .range(from, from + PAGE_SIZE - 1)

    if (error) return {data: null, error}

    allRows.push(...(data ?? []))
    if (!data || data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return {data: allRows, error: null}
}
