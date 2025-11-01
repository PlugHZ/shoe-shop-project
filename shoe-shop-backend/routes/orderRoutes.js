const express = require('express');
const router = express.Router();
const db = require('../config/db'); // 👈 (นี่คือ db ที่เป็น .promise())

// POST /api/orders - สร้างคำสั่งซื้อใหม่
router.post('/', async (req, res) => {
  // 1. ดึงข้อมูลจาก Frontend
  const {
    user_id,
    customer_name,
    shipping_address,
    phone,
    total_price,
    items,
  } = req.body;

  // (สำคัญ!) เราจะใช้ 'db' โดยตรงสำหรับ Transaction
  
  try {
    // --- 2. เริ่ม Transaction ---
    await db.beginTransaction(); // 👈 (แก้!) ใช้ 'db'

    // --- 3. บันทึก "ใบปะหน้า" (ตาราง orders) ---
    const orderSql = `
      INSERT INTO orders (user_id, customer_name, shipping_address, phone, total_price) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [orderResult] = await db.query(orderSql, [ // 👈 (แก้!) ใช้ 'db'
      user_id,
      customer_name,
      shipping_address,
      phone,
      total_price,
    ]);

    const newOrderId = orderResult.insertId;

    // --- 4. บันทึก "รายการสินค้า" (ตาราง order_items) ---
    const itemPromises = items.map(item => {
      const itemSql = `
        INSERT INTO order_items (order_id, product_id, quantity, size, price_at_purchase)
        VALUES (?, ?, ?, ?, ?)
      `;
      return db.query(itemSql, [ // 👈 (แก้!) ใช้ 'db'
        newOrderId,
        item.product_id,
        item.quantity,
        item.size,
        item.price_at_purchase,
      ]);
    });

    await Promise.all(itemPromises);

    // --- 5. (ทางเลือก) ล้างตะกร้า (cart_items) ของ User คนนี้ ---
    if (user_id) {
      const clearCartSql = "DELETE FROM cart_items WHERE user_id = ?";
      await db.query(clearCartSql, [user_id]); // 👈 (แก้!) ใช้ 'db'
    }

    // --- 6. ถ้าทุกอย่างสำเร็จ ---
    await db.commit(); // 👈 (แก้!) ใช้ 'db'
    res.status(201).json({ 
      message: 'Order created successfully', 
      orderId: newOrderId 
    });

  } catch (err) {
    // --- 7. ถ้ามีอะไรพัง ---
    await db.rollback(); // 👈 (แก้!) ใช้ 'db'
    console.error("Error creating order: ", err);
    res.status(500).json({ error: "Failed to create order" });
  } 
  // (เราลบ .finally และ .release() ทิ้ง เพราะ 'db' ไม่ใช่ pool)
});

module.exports = router;