const mysql = require('mysql2');

const dbConfig = {
  // Get ProxySQL unix domain socket path from the environment
  // socketPath: process.env["CC_MYSQL_PROXYSQL_SOCKET_PATH"],
  // Get the database host from the environment
  host: process.env["MYSQL_ADDON_HOST"] || "brkiph080qasany5ess2-mysql.services.clever-cloud.com",
  // Get the database user from the environment
  user: process.env["MYSQL_ADDON_USER"] || "uwukzrqexowjvmvp",
  // Get the database password from the environment
  password: process.env["MYSQL_ADDON_PASSWORD"] || "gxxqme31ZPB6VxDVJ27V",
  // Get the database name from the environment
  database: process.env["MYSQL_ADDON_DB"] || "brkiph080qasany5ess2"
};
// Create a connection pool
const pool = mysql.createPool(dbConfig);

module.exports = pool;
