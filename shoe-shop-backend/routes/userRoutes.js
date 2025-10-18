const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/users - สร้างผู้ใช้ใหม่ในฐานข้อมูลของเรา
router.post('/', (req, res) => {
  const { email, firebase_uid } = req.body;

  // ตรวจสอบว่ามีข้อมูลที่จำเป็นส่งมาครบหรือไม่
  if (!email || !firebase_uid) {
    return res.status(400).json({ error: 'Email and Firebase UID are required' });
  }

  const sql = "INSERT INTO users (email, firebase_uid, role) VALUES (?, ?, 'customer')";
  const values = [email, firebase_uid];
  // GET /api/users/:uid - ดึงข้อมูลผู้ใช้คนเดียว
router.get('/:uid', (req, res) => {
  const { uid } = req.params;
  const sql = "SELECT id, email, role FROM users WHERE firebase_uid = ?";

  db.query(sql, [uid], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Failed to fetch user" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(results[0]);
  });
});

  db.query(sql, values, (err, result) => {
    if (err) {
      // 1062 คือ error code ของ MySQL ที่บอกว่ามีข้อมูลซ้ำ (UNIQUE constraint)
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'User already exists' });
      }
      console.error("Error creating user: ", err);
      return res.status(500).json({ error: "Failed to create user in database" });
    }
    res.status(201).json({ message: "User created successfully", userId: result.insertId });
  });
});

module.exports = router;