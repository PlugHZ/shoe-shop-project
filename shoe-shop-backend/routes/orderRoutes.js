const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");

// ตั้งค่า Client เชื่อมต่อ AWS (ดึงค่าจาก .env)
const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ตั้งค่า Multer ให้ไป S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_SLIP_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // ตั้งชื่อไฟล์: slip-เวลา-เลขสุ่ม.นามสกุล
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, "slip-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
});

/* GET Orders (Admin ดึงทั้งหมด) */
router.get("/", async (req, res) => {
  try {
    const sql = `SELECT *, created_at AS date FROM orders ORDER BY id DESC`;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* PUT Update Status (Admin เปลี่ยนสถานะ) */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  // รับค่ามาทั้ง 2 แบบ
  const { status, payment_status } = req.body;
  try {
    let sql;
    let params;
    // กรณี 1ถ้าส่ง payment_status มา (เช่น paid)  อัปเดตเรื่องเงิน
    if (payment_status) {
      sql = "UPDATE orders SET payment_status = ? WHERE id = ?";
      params = [payment_status, id];
    }
    // กรณี 2 ถ้าส่ง status มา (เช่น shipped) อัปเดตเรื่องขนส่ง
    else if (status) {
      sql = "UPDATE orders SET status = ? WHERE id = ?";
      params = [status, id];
    } else {
      return res.status(400).json({ error: "No update data provided" });
    }

    await db.query(sql, params);
    res.json({ message: "Updated successfully", id, status, payment_status });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ error: "Failed to update status: " + err.message });
  }
});

/* GET User Orders History (ลูกค้า ดูประวัติ) */
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const sql = `
      SELECT 
        o.id AS order_id, o.created_at, o.total_price, o.status, 
        o.payment_method, o.slip_image,
        oi.product_id, oi.quantity, oi.size, oi.price_at_purchase, 
        oi.image AS item_image,
        p.name AS product_name,
        p.image_urls 
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
          payment_method: row.payment_method,
          slip_image: row.slip_image,
          items: [],
        });
      }

      // Logic แกะรูปภาพสินค้า
      let productMainImage = null;
      if (row.image_urls) {
        let images = row.image_urls;
        if (typeof images === "string") {
          try {
            images = JSON.parse(images);
          } catch (e) {
            images = [];
          }
        }
        if (Array.isArray(images) && images.length > 0)
          productMainImage = images[0];
      }

      const finalImage = row.item_image || productMainImage;

      ordersMap.get(row.order_id).items.push({
        product_id: row.product_id,
        name: row.product_name,
        quantity: row.quantity,
        size: row.size,
        price: row.price_at_purchase,
        image: finalImage,
      });
    });
    res.json(Array.from(ordersMap.values()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/* POST Create Order (สร้างคำสั่งซื้อ + อัปโหลดสลิปไป S3) */
router.post("/", upload.single("slip_image"), async (req, res) => {
  try {
    const {
      user_id,
      customer_name,
      shipping_address,
      phone,
      total_price,
      payment_method,
    } = req.body;

    // รับ URL จาก S3
    const slip_image = req.file ? req.file.location : null;

    let items = [];
    if (req.body.items) {
      items = JSON.parse(req.body.items);
    }

    await db.beginTransaction();
    const orderSql = `
      INSERT INTO orders 
      (user_id, customer_name, shipping_address, phone, total_price, payment_method, status, payment_status, slip_image)
      VALUES (?, ?, ?, ?, ?, ?, 'processing', 'pending', ?)
    `;

    const userIdVal =
      !user_id || user_id === "null" || user_id === "undefined"
        ? null
        : user_id;

    const [result] = await db.query(orderSql, [
      userIdVal,
      customer_name,
      shipping_address,
      phone,
      total_price,
      payment_method || "transfer",
      slip_image,
    ]);

    const orderId = result.insertId;

    if (items.length > 0) {
      const itemSql = `INSERT INTO order_items (order_id, product_id, quantity, size, price_at_purchase, image) VALUES ?`;
      const itemValues = items.map((i) => [
        orderId,
        i.product_id,
        i.quantity,
        i.size,
        i.price_at_purchase,
        i.image || null,
      ]);
      await db.query(itemSql, [itemValues]);
    }

    if (userIdVal)
      await db.query("DELETE FROM cart_items WHERE user_id = ?", [userIdVal]);

    await db.commit();
    res.status(201).json({ message: "Success", orderId });
  } catch (err) {
    await db.rollback();
    console.error("Order Error:", err);
    res.status(500).json({ error: "Failed to create order: " + err.message });
  }
});

module.exports = router;
