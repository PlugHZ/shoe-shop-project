const express = require("express");
const router = express.Router();
const db = require("../config/db");

/*  GET ประวัติการสั่งซื้อของผู้ใช้*/
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const sql = `
      SELECT 
        o.id AS order_id,
        o.created_at,
        o.total_price,
        o.status,

        oi.product_id,
        oi.quantity,
        oi.size,
        oi.price_at_purchase,
        oi.image,

        p.name AS product_name
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `;

    const [rows] = await db.query(sql, [userId]);

    const ordersMap = new Map();

    rows.forEach((row) => {
      if (!ordersMap.has(row.order_id)) {
        ordersMap.set(row.order_id, {
          id: row.order_id,
          date: row.created_at,
          total: row.total_price,
          status: row.status,
          items: [],
        });
      }

      ordersMap.get(row.order_id).items.push({
        product_id: row.product_id,
        name: row.product_name,
        quantity: row.quantity,
        size: row.size,
        price: row.price_at_purchase,
        image: row.image || null, //ใช้จาก order_items โดยตรง
      });
    });

    res.json(Array.from(ordersMap.values()));
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/*  POST สร้างคำสั่งซื้อใหม่ */
router.post("/", async (req, res) => {
  const {
    user_id,
    customer_name,
    shipping_address,
    phone,
    total_price,
    items,
  } = req.body;

  try {
    await db.beginTransaction();

    //สร้าง order
    const orderSql = `
      INSERT INTO orders 
      (user_id, customer_name, shipping_address, phone, total_price)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [orderResult] = await db.query(orderSql, [
      user_id,
      customer_name,
      shipping_address,
      phone,
      total_price,
    ]);

    const orderId = orderResult.insertId;

    //สร้าง order_items รวม image
    const itemSql = `
      INSERT INTO order_items
      (order_id, product_id, quantity, size, price_at_purchase, image)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    for (const item of items) {
      await db.query(itemSql, [
        orderId,
        item.product_id,
        item.quantity,
        item.size,
        item.price_at_purchase,
        item.image || null, //รูปจาก Checkout
      ]);
    }

    //ล้าง cart
    if (user_id) {
      await db.query("DELETE FROM cart_items WHERE user_id = ?", [user_id]);
    }

    await db.commit();

    res.status(201).json({
      message: "Order created successfully",
      orderId,
    });
  } catch (err) {
    await db.rollback();
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

module.exports = router;
