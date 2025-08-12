// connection.js (mysql version with async/await support)
require('dotenv').config();
const mysql = require('mysql');
const util = require('util');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'switchyard.proxy.rlwy.net',
  port: process.env.DB_PORT || 31104,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'railway',
  connectionLimit: 10,
  acquireTimeout: 60000, // wait up to 60s for a free connection
  connectTimeout: 60000, // wait up to 60s to connect
  timezone: 'Z', // UTC timezone
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Promisify for async/await
pool.query = util.promisify(pool.query);
pool.getConnection = util.promisify(pool.getConnection);

// Test connection
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected successfully to Railway!');
    console.log(`📊 Connected to database: ${process.env.DB_NAME || 'railway'}`);
    conn.release();
  } catch (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
    console.error('Connection details:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });
  }
})();

module.exports = pool;
