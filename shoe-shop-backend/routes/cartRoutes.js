const express = require('express');
const router = express.Router();
const db = require('../config/db'); // 👈

// --- (GET) ดึงสินค้าในตะกร้าทั้งหมดของผู้ใช้ 1 คน (พร้อมข้อมูลสินค้า) ---
router.get('/user/:userId', async (req, res) => { // 👈 (แก้เป็น async)
  try {
    const { userId } = req.params;
    const sql = `
      SELECT 
        cart_items.id, 
        cart_items.product_id, 
        cart_items.quantity, 
        cart_items.size,
        products.name,
        products.price,
        products.image_urls 
      FROM cart_items
      JOIN products ON cart_items.product_id = products.id
      WHERE cart_items.user_id = ?
    `;
    const [results] = await db.query(sql, [userId]); // 👈 (แก้เป็น await)
    res.json(results);
  } catch (err) {
    console.error("Error fetching cart items: ", err);
    return res.status(500).json({ error: "Failed to fetch cart items" });
  }
});

// --- (POST) เพิ่มสินค้าลงในตะกร้า ---
router.post('/', async (req, res) => { // 👈 (แก้เป็น async)
  try {
    const { user_id, product_id, quantity, size } = req.body;
    const checkSql = "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?";

    const [results] = await db.query(checkSql, [user_id, product_id, size]); // 👈 (แก้เป็น await)

    if (results.length > 0) {
      // 2. ถ้ามี -> ให้อัปเดตจำนวน (UPDATE)
      const existingItem = results[0];
      const updateSql = "UPDATE cart_items SET quantity = ? WHERE id = ?";
      const newQuantity = existingItem.quantity + quantity;

      await db.query(updateSql, [newQuantity, existingItem.id]); // 👈 (แก้เป็น await)
      res.status(200).json({ message: "Quantity updated", cartItemId: existingItem.id });

    } else {
      // 3. ถ้าไม่มี -> ให้เพิ่มแถวใหม่ (INSERT)
      const insertSql = "INSERT INTO cart_items (user_id, product_id, quantity, size) VALUES (?, ?, ?, ?)";

      const [insertResult] = await db.query(insertSql, [user_id, product_id, quantity, size]); // 👈 (แก้เป็น await)
      res.status(201).json({ message: "Item added to cart", cartItemId: insertResult.insertId });
    }
  } catch (err) {
    console.error("Error checking/inserting cart item: ", err); 
    return res.status(500).json({ error: "Database error" });
  }
});

// --- (DELETE) ลบสินค้าออกจากตะกร้า ---
router.delete('/:itemId', async (req, res) => { // 👈 (แก้เป็น async)
  try {
    const { itemId } = req.params;
    const sql = "DELETE FROM cart_items WHERE id = ?";

    await db.query(sql, [itemId]); // 👈 (แก้เป็น await)
    res.status(200).json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Error removing cart item: ", err);
    return res.status(500).json({ error: "Failed to remove item" });
  }
});

// --- (PUT) อัปเดตจำนวนสินค้าในตะกร้า (เช่น แก้จาก 1 เป็น 5) ---
router.put('/:itemId', async (req, res) => { // 👈 (แก้เป็น async)
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (parseInt(quantity) < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    const sql = "UPDATE cart_items SET quantity = ? WHERE id = ?";

    await db.query(sql, [quantity, itemId]); // 👈 (แก้เป็น await)
    res.status(200).json({ message: "Quantity updated" });
  } catch (err) {
    console.error("Error updating cart quantity (PUT): ", err);
    return res.status(500).json({ error: "Failed to update quantity" });
  }
});

module.exports = router;