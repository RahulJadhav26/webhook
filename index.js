// Require express and body-parser
const express = require("express")
const bodyParser = require("body-parser")

// Initialize express and define a port
const app = express()
const PORT = 3000

// Tell express to use body-parser's JSON parsing
app.use(bodyParser.json())

//...
app.use(bodyParser.json())
var arr = []
app.post("/hook", (req, res) => {
  arr.push(req.body)  
  console.log(req.body) // Call your action on the request here
  if(arr.length > 200 ){
   arr = arr.slice(50,200)
  }
  res.status(200).end() // Responding is important
})
app.get("/", (req,res)=>{
    res.send("Welcome to CENT LOCAL SERVER")
})
app.get("/data", (req,res)=>{
    res.send(arr)
})

//...

// Start express on the defined port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))    