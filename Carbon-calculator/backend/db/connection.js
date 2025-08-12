require('dotenv').config();
const mysql = require('mysql2');
const util = require('util');

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || 'switchyard.proxy.rlwy.net',
  port: process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : 31104,
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'railway',
  connectionLimit: 10,
  acquireTimeout: 60000,
  connectTimeout: 60000,
  timezone: 'Z',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.query = util.promisify(pool.query);
pool.getConnection = util.promisify(pool.getConnection);

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL2 connected successfully to Railway!');
    console.log(`📊 Connected to database: ${process.env.MYSQLDATABASE || 'railway'}`);
    conn.release();
  } catch (err) {
    console.error('❌ Error connecting to MySQL2:', err.message);
    console.error('Connection details:', {
      host: process.env.MYSQLHOST,
      port: process.env.MYSQLPORT,
      user: process.env.MYSQLUSER,
      database: process.env.MYSQLDATABASE
    });
  }
})();

module.exports = pool;
