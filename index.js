const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const axios = require('axios');

app.use(cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters - Tutorial for handling POST requests using express.
//JS objects: https://www.w3schools.com/js/js_objects.asp

let db = new sqlite3.Database('./FloodMonitoring.db');

//-----Test Get Request -----

app.get('/Test', (req, res, next) => 
{
  res.send("tesssssstttttt");
});

//-----GetSensorDetails------

app.post('/GetSensorDetails', (req, res, next) =>
{
  let sql = 'SELECT sensor_id, sensor_name, latitude, longitude, MQTT FROM SensorDetails';

  db.all(sql, [], (err, rows) => {
  if (err)
  {
    throw err;
  }
  console.log(rows) //Test, This is what its sending back
  res.send(rows);

  //This is test - This should be the result or to be sent
  rows.forEach((row) =>
  {
    console.log(row.sensor_id);
  });

  });

  //db.close();
});


//-----GetMostRecentFloodWarnings------


app.post('/GetMostRecentFloodWarningMQTT', (req, res, next) =>
{     
  let sql2 = 'SELECT * FROM FloodStatus WHERE sensor_id = ? AND test_mode = "False" ORDER BY ID DESC LIMIT 1';
  var sensor_id = req.body.sensor_id;
  var test_mode = req.body.test_mode;

  if(test_mode == "true")
  {
    sql2 = 'SELECT * FROM FloodStatus WHERE sensor_id = ? ORDER BY ID DESC LIMIT 1';
  }

  db.get(sql2, [sensor_id], (err, floodAlert) => 
  {
    if (err) {
      throw err;
    }

  let sensorFloodStatus = {sensor_id: sensor_id, severity_level: "No concerns"};

  if(floodAlert)
  {
    sensorFloodStatus = {sensor_id: sensor_id, severity_level: floodAlert.severity_level};
  }
 
  res.send(sensorFloodStatus);
  });
});

//-----GetLast24HoursOfData------

app.post('/GetLast24HoursOfDataMQTT', (req, res, next) =>
{
  var sensor_id = req.body.sensor_id;  
  var test_mode = req.body.test_mode; 

  let sql = 'SELECT * FROM HistoricalData WHERE datetime <= datetime("now","-1 day") AND sensor_id = ? AND test_mode = "False"';

  if(test_mode == "true")
  {
    sql = 'SELECT * FROM HistoricalData WHERE datetime <= datetime("now","-1 day") AND sensor_id = ?';
  }
  //object format: sensor24Data {sensor_id: sensor_id, water_height: value, date: date};
  db.all(sql, [sensor_id], (err, rows) => 
  {
    if (err) {
      console.log(err);
      throw err;
    }

  res.send(rows)
  });

});

//-----GetCurrentValue------

app.post('/GetCurrentValueMQTT', (req, res, next) =>
{
  var sensor_id = req.body.sensor_id;
  var test_mode = req.body.test_mode;

  let sql = 'SELECT * FROM SensorDetails WHERE sensor_id = ?';

  let isMQTT = false;
  let latestSensorReading = -1;

  if(sensor_id != undefined)
  {
      //use sensor id to find if sensor is MQTT or not
      db.get(sql, [sensor_id], (err, row) =>
      {
        console.log("ROW: " + JSON.stringify(row));

        if(row.MQTT == "True")
        {
          console.log("MQTT is true");
            //get lastest reading from most recent value in database for that sensor
          sql = "SELECT value_mm FROM HistoricalData WHERE sensor_id = ? AND test_mode = 'False' ORDER BY ID DESC LIMIT 1";

          if(test_mode == "true")
          {
            sql = "SELECT value_mm FROM HistoricalData WHERE sensor_id = ? ORDER BY ID DESC LIMIT 1";
          }

          db.get(sql, [sensor_id], (err, row)=>
          {
            latestSensorReading = row;

            res.send(latestSensorReading)
          });
        }
      });
  }

});

app.post('/AddTestModeMQTTData', (req, res, next) => 
{
  var sensor_id = req.body.sensor_id;
  var value_mm = req.body.value_mm;
  var datetime = req.body.datetime;

  const d2345_distance_sensor_river_bed = 1340;
  const d2345_distance_flood_from_river_bed = 1200;
  const d2345C = d2345_distance_sensor_river_bed - d2345_distance_flood_from_river_bed

  const d09f3_distance_sensor_river_bed = 1820;
  const d09f3_distance_flood_from_river_bed = 1820;
  const d09f3C = d09f3_distance_sensor_river_bed - d09f3_distance_flood_from_river_bed
  
  let sqlHistoricalData = "INSERT INTO HistoricalData (sensor_id,value_mm,datetime,test_mode) VALUES (?,?,?,'True')"

  db.run(sqlHistoricalData, [sensor_id, value_mm, datetime], function(err)
  {
    if(err)
      console.log(err);
  });

  if (sensor_id == 'lairdc0ee400001012345') 
  {
    if (value_mm >= d2345C) 
    {
      storeFloodStatus(sensor_id, datetime, 'Flooding Alert');
    } else {
      storeFloodStatus(sensor_id, datetime, 'No concerns');
    }

  } else if (sensor_id == 'lairdc0ee4000010109f3') 
  {
    if (value_mm >= d09f3C) 
    {
      storeFloodStatus(sensor_id, datetime, 'Flooding Alert');
    } else 
    {
      storeFloodStatus(sensor_id, datetime, 'No concerns');
    }
  }

});

function storeFloodStatus(sensor_id, datetime, severity_level)
{
  let sqlFloodStatus = "INSERT INTO FloodStatus (sensor_id,datetime,severity_level,test_mode) VALUES (?,?,?, 'True')"

  db.run(sqlFloodStatus, [sensor_id, datetime, severity_level], function(err)
  {
    console.log(err);
  });
}

//PORT STUFF

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}...`));
