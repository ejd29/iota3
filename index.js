const express = require('express');
var cors = require('cors');
const app = express();
var bodyParser = require('body-parser');

const sqlite3 = require('sqlite3').verbose();

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

app.post('/GetSensorDetails', (req, res, next) =>
{
  let sql = 'SELECT hardware_serial_station_id, latitude, longitude FROM SensorDetails';

  db.all(sql, [], (err, rows) => {
  if (err) {
    throw err;
  }
  console.log(rows) //Test, This is what its sending back
  res.send(rows);

  //This is test - This should be the result or to be sent
  rows.forEach((row) => {
    console.log(row.hardware_serial_station_id);
  });

  });

  db.close();
});

app.post('/GetMostRecentFloodWarnings', (req, res, next) =>
{
  //get sensor details to obtain all sensor ids (from db)
  let sql1 = 'SELECT hardware_serial_station_id FROM SensorDetails';

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

  db.all(sql2, [sensor_id.hardware_serial_station_id], (err, rows2) => {
    if (err) {
      throw err;
    }

  let sensorFloodStatus = {sensor_id: row.hardware_serial_station_id, severity_level: rows2[0].severity_level};
  floodWarningList.push(sensorFloodStatus);
});
});

res.send(floodWarningList);

});

app.post('/GetLast24HoursOfData', (req, res, next) =>
{
  //var sensor_id = req.body.sensor_id; NEED TO INCLUDE TEST

  //find last 24 hours of data according to the sensor_id given.
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

app.post('/GetCurrentValue', (req, res, next) =>
{
  var sensor_id = req.body.sensor_id;
  //use sensor id to find if sensor is MQTT or not


  //if (sensor_id is MQTT)
    //get lastest reading from most recent value in database for that sensor
  //else
    //(sensor is gov api)
    //get latest reading by calling api
  //res.send(latest sensor reading)
});


const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}...`));
