// require('dotenv').config();
// const { Pool } = require('pg');

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
// });

// // Test connection
// pool.connect((err, client, release) => {
//   if (err) {
//     console.error('Error acquiring client', err.stack);
//   } else {
//     console.log('PostgreSQL connected successfully!');
//     release();
//   }
// });

// module.exports = pool;
require('dotenv').config();
const mysql = require('mysql2/promise');

// Create connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'switchyard.proxy.rlwy.net',
  port: process.env.DB_PORT || 31104,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD, // Your Railway MySQL password
  database: process.env.DB_NAME || 'railway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  reconnect: true,
  acquireTimeout: 60000,
  timeout: 60000
});

// Test connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL connected successfully to Railway!');
    connection.release();
  } catch (err) {
    console.error('Error connecting to MySQL:', err.message);
  }
})();

module.exports = pool;