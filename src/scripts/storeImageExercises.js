

const sleep = (time) => {
    return   new Promise(resolve => setTimeout(resolve, time)

  )
  }


  let count = 0


const runBackFill = async() => {


    if (count >= 3) {
        console.log("retries exhausted. terminating function")
        return
    }

console.log("starting backfill")

    const url = "https://sudaxmkqsdilkjylccqu.supabase.co/functions/v1/backfill-exercise-image"
    const options = {
        method : "POST",
        headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1ZGF4bWtxc2RpbGtqeWxjY3F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMDM1MjcsImV4cCI6MjA4Njg3OTUyN30.pQbyTYDZXvQABPU7373JUayQKvceYN90NsXWHP4e3Rw",
           "Content-Type": "application/json"
        }, 
        body: JSON.stringify({name: "Functions"})
    }

    const response = await fetch(url, options)

    if (!response.ok){
        console.log("Error with fetch")
        ++count
        await sleep(2000)
        return runBackFill()
    
    }

    const result = await response.json()

    console.log(result)

    if (result.message === "Batch completed, no more exercises to process") {
        console.log("backfill completed")
        return
    }

    if (result.remaining > 0 ) {
        console.log(`batch run completed. processed: ${result.processed}, remaining: ${result.remaining}`)
        count = 0
        await sleep(2000)
       return  runBackFill()
     }
     
    }


runBackFill()

    //TODO: need to add try/catch for detailed logging and handling