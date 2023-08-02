// db.js
const mysql = require('mysql');

const connection = mysql.createConnection({
  // Get ProxySQL unix domain socket path from the environment
  socketPath: process.env["CC_MYSQL_PROXYSQL_SOCKET_PATH"],
  // Get the database user from the environment
  user: process.env["MYSQL_ADDON_USER"],
  // Get the database password from the environment
  password: process.env["MYSQL_ADDON_PASSWORD"],
  // Get the database name from the environment
  database: process.env["MYSQL_ADDON_DB"]
});

module.exports = connection;
