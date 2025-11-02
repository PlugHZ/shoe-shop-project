const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

// POST /api/users - สร้างผู้ใช้ใหม่ 
router.post('/', async (req, res) => { 
  try { 
    const { email, firebase_uid } = req.body;

    if (!email || !firebase_uid) {
      return res.status(400).json({ error: 'Email and Firebase UID are required' });
    }

    const sql = "INSERT INTO users (email, firebase_uid, role) VALUES (?, ?, 'customer')";
    const values = [email, firebase_uid];

    const [result] = await db.query(sql, values); 

    res.status(201).json({ message: "User created successfully", userId: result.insertId });

  } catch (err) { // 
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'User already exists' });
    }
    console.error("Error creating user: ", err);
    return res.status(500).json({ error: "Failed to create user in database" });
  }
});

// GET /api/users/:uid - ดึงข้อมูลผู้ใช้คนเดียว 
router.get('/:uid', async (req, res) => { 
  try {
    const { uid } = req.params;
    const sql = "SELECT id, email, role FROM users WHERE firebase_uid = ?";

    const [results] = await db.query(sql, [uid]); 

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" }); 
    }
    res.json(results[0]); 

  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

module.exports = router;