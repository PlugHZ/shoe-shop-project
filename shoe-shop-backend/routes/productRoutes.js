const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Import database connection

// GET /api/products - ดึงสินค้าทั้งหมด
router.get('/', (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching products: ", err);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
    res.json(results);
  });
});

// POST /api/products - เพิ่มสินค้าใหม่ (ตอนนี้รับแค่ข้อมูลตัวหนังสือก่อน)
router.post('/', (req, res) => {
  const { name, brand, description, price, stock, image_url } = req.body;
  const sql = "INSERT INTO products (name, brand, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)";
  const values = [name, brand, description, price, stock, image_url];

  db.query(sql, values, (err, result) => {
    if (err) {
        console.error("Error creating product: ", err);
        return res.status(500).json({ error: "Failed to create product" });
    }
    res.status(201).json({ message: "Product created successfully", productId: result.insertId });
  });
});

module.exports = router;