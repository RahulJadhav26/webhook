const express = require('express')
const router = express.Router()

router.get('/data', (req,res)=>{
    console.log("Data Requested")
    res.send(data)
})
router.post("/hook", (req, res) => {
    arr.push(req.body)  
    console.log(req.body) // Call your action on the request here
    if(arr.length > 200 ){
     arr = arr.slice(50,200)
    }
    res.status(200).end() // Responding is important
  })

  module.exports = router 