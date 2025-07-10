require('dotenv').config(); 
const mysql = require('mysql'); 

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
db.connect((err) => {
  if (err) {
    console.error("Connection failed:", err);
  } else {
    console.log("MySQL connected successfully!");
  }
});

module.exports = db;

