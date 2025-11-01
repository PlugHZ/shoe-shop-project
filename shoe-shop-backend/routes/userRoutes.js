const express = require('express');
const router = express.Router();
const db = require('../config/db'); // 👈 (นี่คือ .promise() ที่เราแก้แล้ว)

// POST /api/users - สร้างผู้ใช้ใหม่ (แก้แล้ว)
router.post('/', async (req, res) => { // 👈 1. เพิ่ม async
  try { // 👈 2. เพิ่ม try
    const { email, firebase_uid } = req.body;

    if (!email || !firebase_uid) {
      return res.status(400).json({ error: 'Email and Firebase UID are required' });
    }

    const sql = "INSERT INTO users (email, firebase_uid, role) VALUES (?, ?, 'customer')";
    const values = [email, firebase_uid];

    const [result] = await db.query(sql, values); // 👈 3. ใช้ await

    res.status(201).json({ message: "User created successfully", userId: result.insertId });

  } catch (err) { // 👈 4. เพิ่ม catch
    // (โค้ด Error เดิม)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'User already exists' });
    }
    console.error("Error creating user: ", err);
    return res.status(500).json({ error: "Failed to create user in database" });
  }
});

// GET /api/users/:uid - ดึงข้อมูลผู้ใช้คนเดียว (แก้แล้ว)
router.get('/:uid', async (req, res) => { // 👈 1. เพิ่ม async
  try { // 👈 2. เพิ่ม try
    const { uid } = req.params;
    const sql = "SELECT id, email, role FROM users WHERE firebase_uid = ?";

    const [results] = await db.query(sql, [uid]); // 👈 3. ใช้ await

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" }); 
    }
    res.json(results[0]); 

  } catch (err) { // 👈 4. เพิ่ม catch
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

module.exports = router;