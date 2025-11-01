import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // 👈 1. Import "Auth" เพื่อดูว่าใครล็อกอิน

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// (นี่คือ URL ของ Backend ที่เรารันไว้)
const API_URL = 'http://localhost:3001/api/cart';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false); // (เพิ่ม state สำหรับการโหลด)
  const { user } = useAuth(); // 👈 2. ดึงข้อมูล user ที่ล็อกอินอยู่ (ตอนนี้จะมี user.id แล้ว [previous step])

  // --- 3. (ใหม่!) ฟังก์ชันสำหรับดึงข้อมูลตะกร้าจาก DB ---
  const fetchCart = async () => {
    // (แก้!) เช็คให้ชัวร์ว่ามี user.id (จาก MySQL [previous step])
    if (!user || !user.id) { 
      setCartItems([]); // ถ้าไม่ได้ล็อกอิน หรือ user ยังไม่มี id, ตะกร้าต้องว่าง
      return;
    }

    setLoading(true);
    try {
      // (เราใช้ user.id จาก AuthContext ที่เราแก้ในขั้นตอนที่ 2) [previous step]
      const response = await fetch(`${API_URL}/user/${user.id}`); 
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      
      // (แก้!) ตรวจสอบก่อนว่า data ที่ได้มาเป็น Array จริงๆ
      if (Array.isArray(data)) {
        // (แก้!) เราต้องเปลี่ยน image_urls (จาก DB) เป็น images (ที่ ProductCard คาดหวัง)
        const mappedData = data.map(item => ({
          ...item,
          images: item.image_urls // 👈 แปลงชื่อคอลัมน์
        }));
        setCartItems(mappedData);
      } else {
        setCartItems([]); // ถ้า API พัง, ให้เป็น Array ว่าง
      }

    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCartItems([]); // ถ้า Error ก็ให้เป็น Array ว่าง
    } finally {
      setLoading(false);
    }
  };

  // --- 4. (ใหม่!) ให้ดึงข้อมูลตะกร้าทุกครั้งที่ "user" เปลี่ยน (เช่น เพิ่งล็อกอิน) ---
  useEffect(() => {
    fetchCart();
  }, [user]);

  // --- 5. (อัปเกรด!) แก้ไขฟังก์ชัน addToCart ---
  const addToCart = async (product, quantity, size) => {
    if (!user || !user.id) { // (แก้!) เช็ค user.id
      alert('กรุณาล็อกอินก่อนเพิ่มสินค้าลงในตะกร้าครับ');
      return Promise.reject("User not logged in"); // (แก้!) ส่ง Reject กลับไป
    }

    try {
      // เรียก API (POST) ที่เราสร้างใน Backend
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id, // ID ของคนที่ล็อกอิน (จาก MySQL)
          product_id: product.id,
          quantity: quantity,
          size: size,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to add item to cart');
      }
      
      // (แก้!) ให้ return fetchCart() เพื่อให้ ProductDetail "await" (รอ) ได้
      return fetchCart(); 

    } catch (error) {
      console.error(error);
      alert(`เกิดข้อผิดพลาดในการเพิ่มสินค้า: ${error.message}`);
      return Promise.reject(error); // (แก้!) ส่ง Reject กลับไป
    }
  };

  // --- 6. (อัปเกรด!) แก้ไขฟังก์ชัน removeFromCart ---
  // (เราจะใช้ "itemId" (ID ของแถวใน cart_items) แทน product.id+size)
  const removeFromCart = async (cartItemId) => {
    try {
      // เรียก API (DELETE) ที่เราสร้างใน Backend
      const response = await fetch(`${API_URL}/${cartItemId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to remove item');
      await fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  // --- 7. (อัปเกรด!) แก้ไขฟังก์ชัน updateQuantity ---
  const updateQuantity = async (cartItemId, newQuantity) => {
    const quantity = Math.max(1, parseInt(newQuantity) || 1);
    try {
      // เรียก API (PUT) ที่เราสร้างใน Backend
      const response = await fetch(`${API_URL}/${cartItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: quantity }),
      });
      if (!response.ok) throw new Error('Failed to update quantity');
      await fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  // --- 8. (อัปเกรด!) คำนวณ cartTotal ---
  const cartTotal = cartItems.reduce((total, item) => (total + (item.price * item.quantity)), 0);

  // ส่งทุกอย่างออกไปให้หน้าอื่นใช้
  const value = { 
    cartItems, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    cartTotal,
    loadingCart: loading, // (ส่งสถานะ loading ออกไปด้วย)
    fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};