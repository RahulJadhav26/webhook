// Require express and body-parser
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const dotenv =require('dotenv')
const assert = require('assert')
const fastcsv = require("fast-csv");
const fs = require("fs");
const ws = fs.createWriteStream("Downloads.csv");


dotenv.config()

// Initialize express and define a port
const app = express()
const PORT = process.env.PORT || 4000

// Tell express to use body-parser's JSON parsing
app.use(bodyParser.json())
app.use(cors())
app.use(bodyParser.json())


var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://Raul1234:Raul1234@cluster0.enbid.mongodb.net";

app.post("/hook", (req, res) => {
  var item = req.body
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("sensor-data");
    dbo.collection("3rd Floor CENT").insertOne(item)
    .then((results)=>{
      console.log("1 document Inserted")
      res.send({status:true,data:results,msg:"1 document Inserted successfully"})
    })
  });
})
app.post("/testhook", (req,res)=>{
  var item = req.body
  MongoClient.connect(url, function(err,db){
    if(err) throw err;
    var dbo = db.db("sensor-data");
    dbo.collection("RaspberryPi").insertOne(item)
    .then((results)=>{
      console.log("1 document Inserted")
      res.send({status:true,data:results,msg:"1 documnet Inserted Successfully"})
    })
  })
})
app.get('/data', (req,res)=>{
 MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("sensor-data");
    dbo.collection("3rd Floor CENT").find({}).toArray()
    .then(results =>{
      var result = results.reverse()
      res.send({status:true, data:result, msg:" All documents queried successfully"})
    })
    .catch(error =>{
      console.error(error)
    })
  })
})
app.get('/downloadAll', (req,res)=>{
 MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("sensor-data");
    dbo.collection("3rd Floor CENT").find({}).toArray()
    .then(data =>{
      fastcsv
          .write(data, { headers: true })
          .on("finish", function() {
            console.log("Write to Downloads.csv successfully!");
          })
          .pipe(ws);
      res.send({status:true, data:data, msg:" All documents queried successfully"})
    })
    .catch(error =>{
      console.error(error)
    })
  })
})
app.post('/download', (req,res)=>{
  var dates = req.body
 MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("sensor-data");
    dbo.collection("3rd Floor CENT").find({ "event_data.timestamp": { $gt:dates[0], $lt:dates[1]} }).toArray()
    .then(data =>{
      fastcsv
          .write(data, { headers: true })
          .on("finish", function() {
            console.log("Write to Downloads.csv successfully!");
          })
          .pipe(ws);
      res.send({status:true, data:data, msg:" All documents queried successfully"})
    })
    .catch(error =>{
      console.error(error)
    })
  })
})

app.get("/", (req,res)=>{
    res.send("Welcome to CENT LOCAL SERVER")
})


//...

// Start express on the defined port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))    
