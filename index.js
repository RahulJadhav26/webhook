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
const routes = require('./routes/esdAPI')
const PORT = process.env.PORT || 4000

// Tell express to use body-parser's JSON parsing
app.use(bodyParser.json())
app.use(cors())
app.use(bodyParser.json())
app.use('/esd',routes)


var MongoClient = require('mongodb').MongoClient;
const { allowedNodeEnvironmentFlags } = require("process")
const { callbackify } = require("util")
var url = process.env.url;
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
app.post("/hook1", (req, res) => {
  var item = req.body
  var collection = req.body.device.thing_name
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("esd_data");
    dbo.collection(collection).insertOne(item)
    .then((results)=>{
      console.log("1 document Inserted")
      res.send({status:true,data:results,msg:"1 document Inserted successfully"})
    })
  });
})
app.get("/getDatabases",(req,res)=>{
  MongoClient.connect(url, function(err,db){
    var adminDB = db.db("test").admin()
    adminDB.listDatabases(function(err,result){
      // console.log(result.databases)
      res.send({status:true, data:result.databases , msg:'All databases fetched'})
    })
  })
})
app.get("/getAllSensors",(req,res)=>{
  var sensors = []
  var flag = false
  var flag1 = false
  MongoClient.connect(url, function(err,db){
    var adminDB = db.db("test").admin()
    adminDB.listDatabases(function(err,result){
      var count = 0
      for(var d in result.databases){
        if(result.databases[d].name !== 'admin' && result.databases[d].name !== 'local'){
            var dbo = db.db(result.databases[d].name)
            dbo.listCollections().toArray()
            .then(data =>{
              for(i in data){
                count = count + 1
                // console.log(count)
                sensors.push(data[i].name)
              }    
            }).then(()=>{
              if( Number(d) === Number(count - 2)){
                 res.send({status: true, data: sensors, msg:"All sensors from all databases queried"})
              }
            })
        }
      }  
    })
  })
})
app.post("/testhook", (req,res)=>{
  var item = req.body
  MongoClient.connect(url, function(err,db){
    if(err) throw err;
    var dbo = db.db("sensor-data");
    dbo.collection("Refrigerator").insertOne(item)
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
      res.send({status:true, data:result, msg:" All 3rd Floor CENT documents queried successfully"})
    })
    .catch(error =>{
      console.error(error)
    })
  })
}),
app.post('/getAllData',(req,res)=>{
  var databaseName = req.body.database
  var allResult = []
  var allAlerts = []
  MongoClient.connect(url, function(err, db){
    if(err) throw err
    console.log(databaseName)
    var dbo = db.db(databaseName)
    dbo.listCollections().toArray()
    .then(data =>{
          var flag = data.length
          var count = 0
          for(var i in data){
            var collection = data[i].name
            dbo.collection(collection).find({}).toArray()
            .then(results =>{
              count = count + 1
              var array = results.reverse()
              array.forEach(element => {
                if(element.event_type === 'alert'){
                  allAlerts.push(element)
                }else if(element.event_type === 'uplink'){
                  allResult.push(element)
                }
              });
            }).then(()=>{
             if(count === flag){
               console.log('All Data queried from the Database ' + databaseName)
              res.send({status:true, data:allResult, alerts:allAlerts, msg: "All Documents are queried of "+ databaseName + " database"})
             }
            })
            .catch(error =>{
              console.error(error)
            }) 
          }
    })
  })
})
app.post('/collection_data',(req,res)=>{
  var collection = req.body.collection
  var databaseName = req.body.database
  console.log(collection)
  console.log(databaseName)
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(databaseName);
    dbo.collection(collection).find({}).toArray()
    .then(results =>{
      var result = results.reverse()
      res.send({status:true, data:result, msg:" All " + collection + " documents queried successfully"})
    })
    .catch(error =>{
      console.error(error)
    })
  })

})
app.post('/collection',(req,res)=>{
 var databaseName = req.body.database
MongoClient.connect(url, function(err, db){
  if(err) throw err
  var dbo = db.db(databaseName)
  dbo.listCollections().toArray()
  .then(data =>{
    res.send(data)
  }) 
})
}),
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
app.post('/moveCollection', (req,res)=>{
  var sourceCollection = req.sourceCollection
  var targetCollection = req.targetCollection
  var targetDatabase = req.targetDatabase
  var destinationDatabase = req.destinationDatabase
  MongoClient.connect(url, function(err,db){
    var dbo = db.db(targetDatabase)
    
    var bulk = client.getSiblingDB(destinationDatabase)[targetCollection].initializeUnorderedBulkOp();
    db.getCollection(sourceCollection).find().forEach(function (d) {
      bulk.insert(d);
    });
    bulk.execute();
  })
})

app.get("/", (req,res)=>{
    res.send("Welcome to CENT LOCAL SERVER")
})


//...

// Start express on the defined port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))    
