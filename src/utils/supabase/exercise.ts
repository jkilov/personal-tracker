import {supabase} from "./client-supabase"


//READ

export const readExerciseData = async()=>{
const {data} = await supabase
.from("exercise")
.select()

return data
}
