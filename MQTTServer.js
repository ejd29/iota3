
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const ttn = require("ttn");

const d2345_distance_sensor_river_bed = 1340;
const d2345_distance_flood_from_river_bed = 1200;

const d09f3_distance_sensor_river_bed = 1820;
const d09f3_distance_flood_from_river_bed = 1820;

var jsonPayloadDate;
var dateTime;

var recpayload;
var jsonpayload;
var payloadhex;
var payloadmm;

const appID = "kentwatersensors";
const accessKey = "ttn-account-v2.7j6Z9OduNwFW7il2Sd28YYF4Q-8l9rDDPaNRFw06-GM";

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

			storeData(jsonpayload.hardware_serial, dateTime, payloadmm);
      storeSensor(jsonpayload.hardware_serial, jsonpayload.metadata.latitude, jsonpayload.metadata.longitude, jsonpayload.metadata.altitude);
      //storeData(jsonpayload.dev_id, dateTime, jsonpayload.counter, payloadmm);
      //storeSensor(jsonpayload.dev_id, jsonpayload.hardware_serial, jsonpayload.metadata.latitude, jsonpayload.metadata.longitude, jsonpayload.metadata.altitude);

    })
  })
  .catch(function (err) {
    console.error(err)
    process.exit(1)
  })

function storeData(dev_id, datetime, value_mm) {

	let db = new sqlite3.Database('./FloodMonitoring.db');

	let incData = [dev_id, datetime, value_mm];
	let placeholders = incData.map((tableColumn) => '?').join(',');
	let sql = 'INSERT INTO HistoricalData(sensor_id, datetime, value_mm) VALUES (' + placeholders + ')';

	db.run(sql, incData, function(err) {
	  if (err) {
	    return console.error(err.message);
	  }
	  console.log(`Rows inserted ${this.changes}`);
	});
	db.close();
}

function storeSensor(hardware_serial_station_id, latitude, longitude, altitude) {

  let dbS = new sqlite3.Database('./FloodMonitoring.db');

  let incSensor = [hardware_serial_station_id, latitude, longitude, altitude];
  let placeholdersS = incSensor.map((tableColumnS) => '?').join(',');
	let sqlS = 'INSERT INTO SensorDetails(hardware_serial_station_id, latitude, longitude, altitude) VALUES (' + placeholdersS + ')';

  dbS.run(sqlS, incSensor, function(err) {
	  if (err) {
	    return console.error(err.message);
	  }
	  console.log(`Rows inserted ${this.changes}`);
	});
	dbS.close();

}
