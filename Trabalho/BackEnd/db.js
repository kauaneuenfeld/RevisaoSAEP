const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'saep_db',
  dateStrings: true
});
