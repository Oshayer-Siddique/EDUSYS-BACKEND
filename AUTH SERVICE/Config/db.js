require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = pool.promise();

// 🔍 Test the connection
(async () => {
  try {
    await db.query('SELECT 1');
    console.log(`✅ MySQL connected successfully to database "${process.env.DB_NAME}"`);
  } catch (err) {
    console.error('❌ MySQL connection error:', err);
  }
})();

module.exports = db;
