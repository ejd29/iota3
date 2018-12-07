const https = require('https');

https.get('https://environment.data.gov.uk/flood-monitoring/id/stations/E3951/readings?latest', (response) => {
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
