// Require express and body-parser
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const dotenv =require('dotenv')

dotenv.config()

// Initialize express and define a port
const app = express()
const routes = require('./routes/dataAPI')
const PORT = process.env.PORT || 4000

// Tell express to use body-parser's JSON parsing
app.use(bodyParser.json())
app.use(cors())
app.use('/api',routes)
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


//...

// Start express on the defined port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))    