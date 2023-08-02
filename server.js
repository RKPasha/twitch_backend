const express = require('express');
const connectionPool = require('./config/connect_db'); // Require the connection pool module
const userRoutes = require('./routes/user_routes'); // Require the user routes module
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors');

// const http = require('http');
// const enforce = require('express-sslify');
// const PORT = 8080;
// const HOST = '0.0.0.0';
// app.use(enforce.HTTPS());
require('dotenv').config();
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use(bodyParser.json());
app.use(cors());
app.use('/api/user', userRoutes); // Use the user routes module for all routes starting with /api/user

// Check the database connection
connectionPool.getConnection(function (err, connection) {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }

  console.log('Connected to the database as id ' + connection.threadId);

  // Release the connection
  connection.release();

  // Start the server and listen on the specified host and port
  // http.createServer(app).listen(PORT, HOST, () => {
  //   console.log(`Server running at http://${HOST}:${PORT}/`);
  // });

  const port = process.env.PORT || 5000
  app.listen(port, () => console.log(`Server running on port ${port}`))
});
