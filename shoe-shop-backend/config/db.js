const mysql = require("mysql2");
require("dotenv").config();
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectTimeout: 30000,
  // การตั้งค่า Pool
  waitForConnections: true,
  connectionLimit: 50, //
  queueLimit: 0,
  timezone: "+07:00", // เวลาตรงกับประเทศไทย
});

// ทดสอบการเชื่อมต่อเมื่อเริ่มรัน Server
pool.getConnection((err, connection) => {
  if (err) {
    console.error(" Database connection failed:", err.message);
  } else {
    console.log("Successfully connected to the database (Pool mode).");
    connection.release(); // คืน connection กลับเข้า pool เสมอ
  }
});

module.exports = pool.promise();
