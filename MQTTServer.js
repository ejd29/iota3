
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const ttn = require("ttn");

const d2345_distance_sensor_river_bed = 1340;
const d2345_distance_flood_from_river_bed = 1200;
const d2345C = d2345_distance_sensor_river_bed - d2345_distance_flood_from_river_bed

const d09f3_distance_sensor_river_bed = 1820;
const d09f3_distance_flood_from_river_bed = 1820;
const d09f3C = d09f3_distance_sensor_river_bed - d09f3_distance_flood_from_river_bed

var jsonPayloadDate;
var dateTime;

var recpayload;
var jsonpayload;
var payloadhex;
var payloadmm;

const appID = "kentwatersensors";
const accessKey = "ttn-account-v2.mRzaS7HOchwKsQxdj1zD-KwjxXAptb7s9pca78Nv7_U";

// discover handler and open mqtt connection
ttn.data(appID, accessKey)
  .then(function (client) {
    client.on("uplink", function (devID, payload) {
      console.log("Received uplink from ", devID);
      console.log(payload);
      recpayload = JSON.stringify(payload);
      jsonpayload = JSON.parse(recpayload);

      payloadhex = jsonpayload.payload_raw.data[0].toString(16) + jsonpayload.payload_raw.data[1].toString(16);
      payloadmm = parseInt(payloadhex, 16);

      console.log("Hex: " + payloadhex);
      console.log("mm: " + payloadmm);

			jsonPayloadDate = new Date(jsonpayload.metadata.time);
			dateTime = jsonPayloadDate.toLocaleString(undefined, {
				day: 'numeric',
				month: 'numeric',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});

      water_height = d09f3_distance_sensor_river_bed - payloadmm;

      allocateData(jsonpayload.dev_id, dateTime, jsonpayload.metadata.latitude, jsonpayload.metadata.longitude, jsonpayload.metadata.altitude, water_height);

    })
  })
  .catch(function (err) {
    console.error(err)
    process.exit(1)
  })

function allocateData(device_id, date_time_alloc, mLatitude, mLongitude, mAltitude, payload_val) {
  storeData(device_id, date_time_alloc, payload_val);
  storeSensor(device_id, mLatitude, mLongitude, mAltitude);
  checkSensor(device_id, date_time_alloc, payload_val);
}

function storeData(dev_id, datetime, value_mm) {

	let db = new sqlite3.Database('./FloodMonitoring.db');

	let incData = [dev_id, datetime, value_mm, 'False'];
	//let placeholders = incData.map((tableColumn) => '?').join(',');
	let sql = 'INSERT INTO HistoricalData(sensor_id, datetime, value_mm, test_mode) VALUES (?,?,?,?)';

	db.run(sql, incData, function(err) {
	  if (err) {
	    return console.error("Historical Data" + err.message);
	  }
	  console.log(`Rows inserted for HistoricalData: ${this.changes}`);
	});
	db.close();
}

function storeSensor(sensor_ID, latitude, longitude, altitude) {

  let dbS = new sqlite3.Database('./FloodMonitoring.db');

  let incSensor = [sensor_ID, latitude, longitude, altitude, "False"];
  let placeholdersS = incSensor.map((tableColumnS) => '?').join(',');
	let sqlS = 'INSERT INTO SensorDetails(sensor_id, latitude, longitude, altitude) VALUES (' + placeholdersS + ')';

  dbS.run(sqlS, incSensor, function(err) {
	  if (err) {
	    return console.error("Sensor Details: " + err.message);
	  }
	  console.log(`Rows inserted SensorDetails: ${this.changes}`);
	});
	dbS.close();

}

function checkSensor(sensor_ID, dateTime_status, value_mm) 
{

  if (sensor_ID == 'lairdc0ee400001012345') {
    if (value_mm >= d2345C) {
      storeFloodStatus(sensor_ID, dateTime_status, 4);
    } else {
      storeFloodStatus(sensor_ID, dateTime_status, 2);
    }

  } else if (sensor_ID == 'lairdc0ee4000010109f3') {
    if (value_mm >= d09f3C) {
      storeFloodStatus(sensor_ID, dateTime_status, 4);
    } else {
      storeFloodStatus(sensor_ID, dateTime_status, 2);
    }
  }

}

function storeFloodStatus(sensor_ID, dateTime_status, severity_level) 
{
  let dbF = new sqlite3.Database('./FloodMonitoring.db');

  let incStatus = [sensor_ID, dateTime_status, severity_level, "False"];
  //let placeholdersF = incStatus.map((tableColumnF) => '?').join(',');
  let sqlF = 'INSERT INTO FloodStatus(sensor_id, datetime, severity_level, test_mode) VALUES (?,?,?,?)';

  dbF.run(sqlF, incStatus, function(err) {
    if (err) 
    {
      return console.error("Flood Status: " + err.message);
    }
    console.log(`Rows inserted FloodStatus: ${this.changes}`);
  });
  dbF.close();
}
