const https = require('https');
const sqlite3 = require('sqlite3').verbose();
// open the database
let db = new sqlite3.Database('./FloodMonitoring.db');

// -- LATEST SENSOR READINGS FOR EACH STATION --
function getLatestAPIValue(){
  // Select all ids that arent MQTT devices
  let sql = `SELECT sensor_id From SensorDetails WHERE sensor_id NOT LIKE 'l%'`;
console.log("work");
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      https.get('https://environment.data.gov.uk/flood-monitoring/id/stations/'+ row.sensor_id + '/readings?latest', (response) => {
          let data = '';

          // A message from the data has been received
          response.on('data', (message) => {
            data += message;
          });

          // The whole response has been received. Print out the result.
          response.on('end', () => {
            console.log(JSON.parse(data));
          });

        }).on("error", (err) => {
          console.log("Error: " + err.message);
        });
    });
  });
}

// -- STATIONS CONNECTED TO GREAT STOUR --

function getGreatStourStations(){
  https.get('https://environment.data.gov.uk/flood-monitoring/id/stations?riverName=Great+Stour', (response) => {
      let data = '';

      // A message from the data has been received
      response.on('data', (message) => {
        data += message;
      });

      // The whole response has been received. Print out the result.
      response.on('end', () => {
        console.log(JSON.parse(data));
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
}


// -- FLOOD WARNINGS FOR ALL KENT STATIONS --

function getFloodWarningsFordwich(){
  https.get('https://environment.data.gov.uk/flood-monitoring/id/floods?lat=51.296461&long=1.129525&dist=1', (response) => {
      let data = '';

      // A message from the data has been received
      response.on('data', (message) => {
        data += message;
      });

      // The whole response has been received. Print out the result.
      response.on('end', () => {
        console.log(JSON.parse(data));
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
}


function getFloodWarningsWye(){
  https.get('https://environment.data.gov.uk/flood-monitoring/id/floods?lat=51.183588&long=0.930529&dist=1', (response) => {
      let data = '';

      // A message from the data has been received
      response.on('data', (message) => {
        data += message;
      });

      // The whole response has been received. Print out the result.
      response.on('end', () => {
        console.log(JSON.parse(data));
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
}


function getFloodWarningsLittleBucket(){
  https.get('https://environment.data.gov.uk/flood-monitoring/id/floods?lat=51.182705&long=1.035354&dist=1', (response) => {
      let data = '';

      // A message from the data has been received
      response.on('data', (message) => {
        data += message;
      });

      // The whole response has been received. Print out the result.
      response.on('end', () => {
        console.log(JSON.parse(data));
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
}

function getFloodWarningsHothfield(){
  https.get('https://environment.data.gov.uk/flood-monitoring/id/floods?lat=51.157688&long=0.815185&dist=1', (response) => {
      let data = '';

      // A message from the data has been received
      response.on('data', (message) => {
        data += message;
      });

      // The whole response has been received. Print out the result.
      response.on('end', () => {
        console.log(JSON.parse(data));
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
}

function getFloodWarningsGroveFerry(){
  https.get('https://environment.data.gov.uk/flood-monitoring/id/floods?lat=51.323963&long=1.206421&dist=1', (response) => {
      let data = '';

      // A message from the data has been received
      response.on('data', (message) => {
        data += message;
      });

      // The whole response has been received. Print out the result.
      response.on('end', () => {
        console.log(JSON.parse(data));
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
}

function getFloodWarningsChartLeacon(){
  https.get('https://environment.data.gov.uk/flood-monitoring/id/floods?lat=51.323963&long=1.206421&dist=1', (response) => {
      let data = '';

      // A message from the data has been received
      response.on('data', (message) => {
        data += message;
      });

      // The whole response has been received. Print out the result.
      response.on('end', () => {
        console.log(JSON.parse(data));
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
}
