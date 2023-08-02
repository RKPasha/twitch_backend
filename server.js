const express = require('express');
const app = express();
const http = require('http');
const enforce = require('express-sslify');
const connection = require('./config/connect_db'); // Require the db.js module

const PORT = 8080;
const HOST = '0.0.0.0';

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use(enforce.HTTPS());

// Connect to the database
connection.connect(function(err) {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }

  console.log('Connected to the database as id ' + connection.threadId);

  // Start the server and listen on the specified host and port
  http.createServer(app).listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}/`);
  });
});
