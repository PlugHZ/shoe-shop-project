const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

// POST /api/orders - สร้างคำสั่งซื้อใหม่
router.post('/', async (req, res) => {
  //  ดึงข้อมูลจาก Frontend
  const {
    user_id,
    customer_name,
    shipping_address,
    phone,
    total_price,
    items,
  } = req.body;

  
  try {
    // เริ่ม Transaction 
    await db.beginTransaction(); 

    //  บันทึก "ใบปะหน้า" (ตาราง orders) 
    const orderSql = `
      INSERT INTO orders (user_id, customer_name, shipping_address, phone, total_price) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [orderResult] = await db.query(orderSql, [ 
      user_id,
      customer_name,
      shipping_address,
      phone,
      total_price,
    ]);

    const newOrderId = orderResult.insertId;

    //  บันทึก "รายการสินค้า" (ตาราง order_items) 
    const itemPromises = items.map(item => {
      const itemSql = `
        INSERT INTO order_items (order_id, product_id, quantity, size, price_at_purchase)
        VALUES (?, ?, ?, ?, ?)
      `;
      return db.query(itemSql, [ 
        newOrderId,
        item.product_id,
        item.quantity,
        item.size,
        item.price_at_purchase,
      ]);
    });

    await Promise.all(itemPromises);

    // ล้างตะกร้า (cart_items) ของ User คนนี้ 
    if (user_id) {
      const clearCartSql = "DELETE FROM cart_items WHERE user_id = ?";
      await db.query(clearCartSql, [user_id]); 
    }

    //  ถ้าทุกอย่างสำเร็จ 
    res.status(201).json({ 
      message: 'Order created successfully', 
      orderId: newOrderId 
    });

  } catch (err) {
    //  ถ้ามีอะไรพัง 
    await db.rollback(); 
    console.error("Error creating order: ", err);
    res.status(500).json({ error: "Failed to create order" });
  } 
});

module.exports = router;