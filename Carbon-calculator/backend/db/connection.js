require('dotenv').config();
const mysql = require('mysql2/promise');

console.log('🔧 Attempting MySQL connection...');

// Use Railway's MYSQL_URL if available, otherwise construct from individual vars
const connectionConfig = process.env.MYSQL_URL ? {
  uri: process.env.MYSQL_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
} : {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'railway',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

const pool = mysql.createPool({
  ...connectionConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timeout: 60000,
  // Removed invalid options that cause warnings
  multipleStatements: true,
  timezone: 'Z'
});

// Test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL2 connected successfully to Railway!');
    
    // Get database name safely
    const dbName = connection.config?.database || process.env.DB_NAME || 'railway';
    console.log(`📊 Connected to database: ${dbName}`);
    
    connection.release();
  } catch (err) {
    console.error('❌ Error connecting to MySQL2:', err.message);
  }
})();

// Handle pool events
pool.on('connection', (connection) => {
  console.log('🔗 New MySQL connection established as id ' + connection.threadId);
});

pool.on('error', (err) => {
  console.error('💥 MySQL pool error:', err);
  if(err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Reconnecting to MySQL...');
  } else {
    throw err;
  }
});

module.exports = pool;