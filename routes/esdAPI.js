const express = require('express')
const router= express.Router()
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = process.env.url;

router.get('/', (req,res) => {
    res.send("Welcome to ESD Database route API")
})
// POST API for QUERYING  THE LOOKUP TABLE FROM THE DATABASE
router.post('/collection', (req,res) => {
    var building = req.body.database
    MongoClient.connect(url, function(err, db){
        if(err) throw err
        var dbo = db.db("Lookup_Table")
        dbo.collection('Building_LT').find({name:building}).toArray()
        .then(results =>{
            var sensors = results[0].sensors
            res.send({status:true, data:sensors, msg:" All " + building + " sensors queried successfully"})
        }) 
        })
    })
// GET API FOR querying all site buildings
router.get('/getBuildings', (req,res)=>{
  MongoClient.connect(url, function(err, db){
    if(err) throw err
    var dbo = db.db("Lookup_Table")
    var buildings = []
    dbo.collection('Building_LT').find({}).toArray()
    .then(results =>{
      for (i in results){
          buildings.push(results[i].name)
      }
    }).then(()=>{
      res.send({status:true,data:buildings, msg :"All Buildings queried from Lookup Table"})
    })
  })
})
// GET API FOR QUERYING ALL THE COLLECTIONS INSIDE SENSOR_COLLECTION
router.get('/getAllSensorCollection',(req,res)=>{
  MongoClient.connect(url,function(err,db){
    if(err) throw err
    var dbo = db.db("SensorCollection")
    var sensors = []
    dbo.listCollections().toArray()
    .then(results =>{
      for(var i in results){
        sensors.push(results[i].name)
      }      
    }).then(()=>{
      res.send({status: true, data:sensors, msg:'All sensors queried from SensorCollection'})
    })
  })
})
// GET API FOR LISTING BUILDING LOOK_UP TABLE
router.get('/getAllBuildings', (req,res)=>{
  MongoClient.connect(url, function(err, db){
    if(err) throw err
    var dbo = db.db('Lookup_Table')
    dbo.collection('Building_LT').find({}).toArray()
    .then((results) => {
      res.send({status: true, data: results, msg:"All buildings Fetched"})
    })
})
})
// GET API for querying all the active sensors
router.get('/getAllSensors', (req,res)=>{
  MongoClient.connect(url, function(err, db){
    if(err) throw err
    var dbo = db.db("Lookup_Table")
    var sensors = []
    dbo.collection('Sensor_LT').find({}).toArray()
    .then(results =>{
      for (i in results[0]){
        if(i !== '_id'){
        sensors.push(i)
        }
      }
    }).then(()=>{
      res.send({status:true,data:sensors, msg :"All Buildings queried from Lookup Table"})
    })
  })
})

// POST API FOR QUERYING ALL DATA FROM A SPECIFIC SENSOR

router.post('/collection_data', (req, res) =>{
  var collection = req.body.collection
  var allResult = []
  var allAlerts = []
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db('SensorCollection');
    dbo.collection(collection).find({}).toArray()
    .then(results =>{
      var result = results.reverse()
      result.forEach(element => {
        if(element.event_type === 'alert'){
          allAlerts.push(element)
        }else if(element.event_type === 'uplink'){
          allResult.push(element)
        }
      })
    }).then(()=>{
      res.send({status:true, data:allResult, alerts:allAlerts, msg: "All "+ collection + " Documents are queried"})
    })
    .catch(error =>{
      console.error(error)
    })
  })
})
// POST API Get All Sensor Data from all sensors in a Building
router.post('/getAllData', (req,res) =>{
    var databaseName = req.body.database
    var allResult = []
    var allAlerts = []
    var count = 0
  MongoClient.connect(url, function(err, db){
    if(err) throw err
    console.log(databaseName)
    var dbo = db.db('Lookup_Table')
    var dbo_Sensor = db.db('SensorCollection')
    dbo.collection('Building_LT').find({name:databaseName}).toArray()
    .then(data =>{
          var sensors = data[0].sensors
          for(var i in sensors){
            var collection = sensors[i]
            dbo_Sensor.collection(collection).find({}).toArray()
            .then(results =>{
              var array = results.reverse()
              array.forEach(element => {
                if(element.event_type === 'alert'){
                  allAlerts.push(element)
                }else if(element.event_type === 'uplink'){
                  allResult.push(element)
                }
              });
            }).then(() => {
              // After every sensor data/alert is pushed to array the count is increased by one and hence matched with the sensors length
              count = count + 1 // after every sensor the count is increased
              if(Number(count) === Number(sensors.length)){
                res.send({status:true, data:allResult, alerts:allAlerts, msg: "All  Documents are queried of Database " + databaseName})
              }
            })
          }
    })
  .catch(error =>{
    console.error(error)
  }) 
  })
})
// POST API TO FETCH THE BUILDING OF THE DESIRED SENSOR
router.post('/findBuilding', (req,res)=>{
  var Sensor = req.body.sensor
  MongoClient.connect(url, function(err, db) {
    if(err) throw err;
    var dbo = db.db("Lookup_Table");
    dbo.collection("Sensor_LT").find({}).toArray()
    .then(data =>{
      var id = data[0][Sensor]
      console.log(id)
      dbo.collection("Building_LT").find({_id:ObjectId(id)}).toArray()
      .then(data =>{
        res.send({status: true, data:data[0], msg:"Building of "+ Sensor + " is retrieved successfully"})
      })
    })
  })
})
// POST API TO EDIT SENSOR LOCATION
router.post('/editSensor', (req,res)=>{
  var payload = req.body
  var Sensor = req.body.sensor
  console.log(payload)
  var id = req.body.destination._id
  MongoClient.connect(url, function(err,db){
    var dbo = db.db("Lookup_Table")
    console.log("Updating the destination Sensors Array")
    dbo.collection("Building_LT")
    .findOneAndUpdate(
      {_id:ObjectId(id)},
      {$push:{sensors : payload.sensor }},
      ).then((data, err)=>{
        if(err) throw err
        else{
          console.log("Updated the destination Sensors Array")
          console.log("Updating the Sensors Lookup Table")
          var set = {}
          set[Sensor] = id
          dbo.collection("Sensor_LT")
            .findOneAndUpdate(
              {_id:ObjectId("617841b0caa110248d7a665c")},
              {$set:set}
            ).then((data,err)=>{
              if(err) throw err
              else{
                console.log("Updated the Sensors Lookup Table")
                console.log("Updating the destination Sensors Array")
                var pull = { 
                  sensors: payload.sensor
                }
                dbo.collection("Building_LT")
                .findOneAndUpdate(
                  {_id:ObjectId(req.body.source._id)},
                  {$pull:pull}
                ).then((data,err)=>{
                  if(err) throw err
                  else{
                    console.log("Updated the destination Sensors Array")
                    res.send({status:true, data:data, msg:"Update successfully Done"})
                    }
                  })
                  .catch((err)=>{
                    res.send({id:"3",status:false, data:err, msg:"Error Occurred while updating the source building LT sensor arra"})
                  })
              }
              })
              .catch((err)=>{
                res.send({id:"2",status:false, data:err, msg:"Error Occurred while updating the Sensor LT "})
              })
        }
      })
      .catch((err)=>{
        res.send({id:"1", status:false, data:err, msg:"Error Occurred while pushing the target Building sensor array"})
      })
  })
})

//Download all data in Excel format

router.post('/downloadAll',(req,res)=>{
  var collection = req.body.collection
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("SensorCollection");
    dbo.collection(collection).find({}).toArray()
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
// POST API for downloading a specific Date Range of data in Excel
router.post('/download',(req,res)=>{
  var dates = req.body.date
  var collection = req.body.collection
 MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("SensorCollection");
    dbo.collection(collection).find({ "event_data.timestamp": { $gt:dates[0], $lt:dates[1]} }).toArray()
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
// POST API FOR ADDING NEW BUILDING
router.post('/addBuilding', (req,res) =>{
  var building = req.body
  var building_name = req.body.name
  MongoClient.connect(url, function(err, db){
    if(err) throw err;
    var dbo = db.db("Lookup_Table")
      dbo.collection("Building_LT").find({name: building_name}).toArray()
        .then((results)=>{
          console.log(results)
          if(results.length !== 0 ){
            res.send({status:false, data:results, msg:"Building name already exist. Please select a new name for the Building "})
          }
          else {
            dbo.collection("Building_LT").insertOne(building)
              .then((results)=>{
                console.log("Building Added")
                res.send({status:true, data:results, msg:"Building is successfully added"})
              })
              .catch((err)=>{
                res.send({status:false, data:err, msg:"Building not added, Faced some issues"})
              }) 
          }
        }) 
    })
  })

// POST WEBHOOK TO RECIEVE DATA FROM MULTITECH
router.post('/hook', (req,res) => {
    var item = req.body
  var collection = req.body.device.thing_name
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("SensorCollection");
    dbo.collection(collection).insertOne(item)
    .then((results)=>{
      console.log("1 document Inserted")
      res.send({status:true,data:results,msg:"1 document Inserted successfully"})
    })
  });
})

module.exports = router