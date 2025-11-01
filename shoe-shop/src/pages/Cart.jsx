import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // 👈 1. Import สมอง (เหมือนเดิม)
import { FaTrashAlt } from 'react-icons/fa';
import './Cart.css'; //

const Cart = () => {
  // 2. ดึงฟังก์ชัน/ข้อมูล มาจาก "สมอง" (CartContext)
  //    (สังเกตว่าเราได้ loadingCart มาเพิ่มด้วย)
  const { cartItems, removeFromCart, updateQuantity, cartTotal, loadingCart } = useCart();

  // 3. (ใหม่!) แสดงผลตอนกำลังโหลดข้อมูลตะกร้า
  if (loadingCart) {
    return (
      <div className="cart-page-container container">
        <h1>ตะกร้าสินค้า</h1>
        <p>กำลังโหลดข้อมูลตะกร้าของคุณ...</p>
      </div>
    );
  }

  return (
    <div className="cart-page-container container">
      <h1>ตะกร้าสินค้า</h1>
      <div className="cart-layout">
        <div className="cart-items-list">
          {cartItems.length === 0 ? (
            <p>ตะกร้าสินค้าของคุณว่างเปล่า</p>
          ) : (
            cartItems.map(item => (
              // 4. (แก้ไข!) เปลี่ยน key ให้ใช้ item.id (ซึ่งตอนนี้คือ ID จากตาราง cart_items)
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  {/* 5. (แก้ไข!) ตรวจสอบ images ก่อนใช้ (เพราะมาจาก DB อาจเป็น null) */}
                  {/* (เราแปลง image_urls -> images ใน Context แล้ว [previous step]) */}
                  <img src={item.images?.[0] || '/images/placeholder.png'} alt={item.name} />
                </div>
                <div className="item-details">
                  {/* (โค้ดเพื่อน มี brand แต่ API ตะกร้า ไม่ได้ดึงมา เราเลยต้องลบออก) */}
                  <p className="item-name">{item.name}</p>
                  <p className="item-size">Size: {item.size}</p>
                  <p className="item-price">{item.price.toLocaleString()} THB</p>
                </div>
                <div className="item-quantity">
                  <input
                    type="number"
                    value={item.quantity}
                    // 6. (แก้ไข!) เรียกฟังก์ชัน updateQuantity ด้วย item.id (ID ของแถวในตะกร้า)
                    onChange={(e) => updateQuantity(item.id, e.target.value)}
                    min="1"
                  />
                </div>
                <div className="item-total">
                  {(item.price * item.quantity).toLocaleString()} THB
                </div>
                <div className="item-remove">
                  {/* 7. (แก้ไข!) เรียกฟังก์ชัน removeFromCart ด้วย item.id (ID ของแถวในตะกร้า) */}
                  <button onClick={() => removeFromCart(item.id)}>
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="order-summary">
            <h2>สรุปคำสั่งซื้อ</h2>
            <div className="summary-row">
              <span>ยอดรวม ({cartItems.length} รายการ)</span>
              <span>{cartTotal.toLocaleString()} THB</span>
            </div>
            <div className="summary-row">
              <span>ค่าจัดส่ง</span>
              <span>0 THB</span>
            </div>
            <hr />
            <div className="summary-row total">
              <span>ยอดรวมทั้งสิ้น</span>
              <span>{cartTotal.toLocaleString()} THB</span>
            </div>
            <Link to="/checkout" className="checkout-btn">
              ไปที่หน้าชำระเงิน
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;