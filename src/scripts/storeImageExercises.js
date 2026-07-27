import dotenv from 'dotenv'

dotenv.config()


const sleep = (time) => {
    return   new Promise(resolve => setTimeout(resolve, time)

  )
  }


  let count = 0
  let batchUploadCount = 0
  const maxIteration = 500


const runBackFill = async() => {



   
console.log("starting backfill")


    const url = `${process.env.VITE_API_URL}/functions/v1/backfill-exercise-image`
    // The backfill function is operator-only: it requires the service-role key
    // as the bearer token. Never expose this key outside local operator use.
    const options = {
        method : "POST",
        headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
           "Content-Type": "application/json"
        },
    }


    
    while (true) {
    try {
     
        if (count >= 3) {
            console.error("retries exhausted. terminating function")
            throw new Error("retries exhausted, terminating function")
        }
    

        const response = await fetch(url, options)

    if (!response.ok){
        console.error("Fetch response error")
        throw new Error("Fetch response error")

    }

    const result = await response.json()
    count = 0

    console.log(result)

    if (result.message === "Batch completed, no more exercises to process") {
        console.log("backfill completed: ", result)
        break;
    }

    if (result.remaining > 0 ) {
        if (batchUploadCount >= maxIteration) throw new Error("max iterations hit.Aborting")
        ++batchUploadCount 
        console.log(`batch run completed. processed: ${result.processed}, remaining: ${result.remaining}`)
        await sleep(2000)
     }
    
    
    } catch (error) {
        if (error.message === "max iterations hit.Aborting") break;

        if (error.message === "retries exhausted. terminating function") {
            console.error(`total retries: ${count}. Aborting script run`)
            count = 0
            break;
        }

        else if (error.message === "Fetch response error") {
            ++count
            await sleep(2000)
        
        } else {
            console.error(error.message)
            ++count
            await sleep(2000)
        }
    }
}

     
    }


runBackFill()



