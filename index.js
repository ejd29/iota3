const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
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


//-----GetSensorDetails------


app.post('/GetSensorDetails', (req, res, next) =>
{
  let sql = 'SELECT sensor_id, latitude, longitude FROM SensorDetails';

  db.all(sql, [], (err, rows) => {
  if (err) {
    throw err;
  }
  console.log(rows) //Test, This is what its sending back
  res.send(rows);

  //This is test - This should be the result or to be sent
  rows.forEach((row) => {
    console.log(row.sensor_id);
  });

  });

  db.close();
});


//-----GetMostRecentFloodWarnings------


app.post('/GetMostRecentFloodWarnings', (req, res, next) =>
{
  //get sensor details to obtain all sensor ids (from db)
  let sql1 = 'SELECT sensor_id FROM SensorDetails';

  let floodWarningList = [];
  let sensor_ids = [];

  db.all(sql1, [], (err, rows) => 
{
  sensor_ids = rows;

    if (err) {
      throw err;
    };
});

sensor_ids.forEach((sensor_id) => 
{
  let sql2 = 'SELECT * FROM FloodStatus WHERE sensor_id = ? ORDER BY DESC LIMIT 1';

  db.get(sql2, [sensor_id.sensor_id], (err, floodAlert) => {
    if (err) {
      throw err;
    }

  let sensorFloodStatus = {sensor_id: sensor_id.sensor_id, severity_level: floodAlert.severity_level};
  floodWarningList.push(sensorFloodStatus);
});
});

res.send(floodWarningList);

});



//-----GetLast24HoursOfData------



app.post('/GetLast24HoursOfData', (req, res, next) =>
{
  let sql = 'SELECT * FROM HistoricalData WHERE datetime <= datetime("now","-1 day") AND sensor_id = "lairdc0ee400001012345"';
  //object format: sensor24Data {sensor_id: sensor_id, water_height: value, date: date};
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.log(err);
      throw err;
    }

  res.send(rows)
});

});


//-----GetCurrentValue------


app.post('/GetCurrentValue', (req, res, next) =>
{
  var sensor_id = req.body.sensor_id;
  let sql = 'SELECT * FROM SensorDetails WHERE sensor_id = ? ORDER BY DESC LIMIT 1';
  let isMQTT = false;
  let latestSensorReading = -1;
  //use sensor id to find if sensor is MQTT or not
  db.get(sql, [sensor_id], (err, row) => 
  {
    if(altitude != null)
    {
      isMQTT = true;
    }
  });

  if (isMQTT)
  {
    //get lastest reading from most recent value in database for that sensor
    sql = "SELECT value_mm FROM HistoricalData WHERE sensor_id = ? ORDER BY DESC LIMIT 1";
  
    db.get(sql, [sensor_id], (err, row)=>
    {
      latestSensorReading = row;
    });

  }else
  {
    //get latest value for sensor by calling the gov api.
    try
    {
      latestReading = getLatestReadingGov();
      latestSensorReading = latestReading.items.value;
      latestSensorReading * 1000;
    }catch(error)
    {
      console.error(error);
    }
  }
    
  res.send(latestSensorReading)
});

//API REQUESTS

const getLatestReadingGov = async () => {
  try {
    return await axios.get('https://environment.data.gov.uk/flood-monitoring/id/stations/E3826/readings?latest')
  } catch (error) {
    console.error(error)
  }
}

//PORT STUFF

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}...`));
