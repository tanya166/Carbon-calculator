require('dotenv').config();
const mysql = require('mysql2/promise');

// Use Railway's MYSQL_URL connection string
const pool = mysql.createPool({
  uri: process.env.MYSQL_URL,
  connectionLimit: 10,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timezone: 'Z',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
(async () => {
  try {
    console.log('🔧 Attempting MySQL connection...');
    
    const connection = await pool.getConnection();
    console.log('✅ MySQL2 connected successfully to Railway!');
    console.log(`📊 Connected to database: ${connection.config.database}`);
    connection.release();
  } catch (err) {
    console.error('❌ Error connecting to MySQL2:', err.message);
  }
})();

module.exports = pool;