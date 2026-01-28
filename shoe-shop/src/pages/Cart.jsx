import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaTrashAlt } from "react-icons/fa";
import "./Cart.css"; //

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, loadingCart } =
    useCart();

  // แสดงผลตอนกำลังโหลดข้อมูลตะกร้า
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
            cartItems.map((item) => (
              //เปลี่ยน key ให้ใช้ item.id (ซึ่งตอนนี้คือ ID จากตาราง cart_items)
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  {/*ตรวจสอบ images ก่อนใช้ (เพราะมาจาก DB อาจเป็น null) */}
                  {/* (เราแปลง image_urls ไป images ใน Context แล้ว [previous step]) */}
                  <img
                    src={item.images?.[0] || "/images/placeholder.png"}
                    alt={item.name}
                  />
                </div>
                <div className="item-details">
                  <p className="item-name">{item.name}</p>
                  <p className="item-size">Size: {item.size}</p>
                  <p className="item-price">
                    {item.price.toLocaleString()} THB
                  </p>
                </div>
                <div className="item-quantity">
                  <div className="quantity-controls-cart">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>

                    <input
                      type="number"
                      value={item.quantity}
                      readOnly /* บังคับให้กดปุ่มเอา */
                    />

                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="item-total">
                  {(item.price * item.quantity).toLocaleString()} THB
                </div>
                <div className="item-remove">
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
