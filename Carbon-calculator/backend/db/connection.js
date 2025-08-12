require('dotenv').config();
const mysql = require('mysql2/promise');

// Use Railway's MYSQL_URL connection string
const pool = mysql.createPool({
  uri: process.env.MYSQL_URL,
  connectionLimit: 10,
  connectTimeout: 60000,
  timeout: 60000,
  timezone: 'Z',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
(async () => {
  try {
    // Check if all required env vars are present
    const requiredVars = ['MYSQLHOST', 'MYSQLPORT', 'MYSQLUSER', 'MYSQLPASSWORD', 'MYSQLDATABASE'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars);
      return;
    }

    console.log('🔧 Attempting connection with:');
    console.log(`🏠 Host: ${process.env.MYSQLHOST?.trim()}`);
    console.log(`🔌 Port: ${process.env.MYSQLPORT}`);
    console.log(`👤 User: ${process.env.MYSQLUSER}`);
    console.log(`📊 Database: ${process.env.MYSQLDATABASE}`);
    
    const connection = await pool.getConnection();
    console.log('✅ MySQL2 connected successfully to Railway!');
    connection.release();
  } catch (err) {
    console.error('❌ Error connecting to MySQL2:', err.message);
    console.error('📋 Full error:', err);
  }
})();

module.exports = pool;