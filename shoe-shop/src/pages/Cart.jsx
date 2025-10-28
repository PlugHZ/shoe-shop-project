import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaTrashAlt } from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <div className="cart-page-container container">
      <h1>ตะกร้าสินค้า</h1>
      <div className="cart-layout">
        <div className="cart-items-list">
          {cartItems.length === 0 ? (
            <p>ตะกร้าสินค้าของคุณว่างเปล่า</p>
          ) : (
            cartItems.map(item => (
              <div key={`${item.id}-${item.size}`} className="cart-item">
                <div className="item-image">
                  <img src={item.images[0]} alt={item.name} />
                </div>
                <div className="item-details">
                  <p className="item-brand">{item.brand}</p>
                  <p className="item-name">{item.name}</p>
                  <p className="item-size">Size: {item.size}</p>
                  <p className="item-price">{item.price.toLocaleString()} THB</p>
                </div>
                <div className="item-quantity">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, item.size, e.target.value)}
                    min="1"
                  />
                </div>
                <div className="item-total">
                  {(item.price * item.quantity).toLocaleString()} THB
                </div>
                <div className="item-remove">
                  <button onClick={() => removeFromCart(item.id, item.size)}>
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
            {/* ค่าจัดส่ง (ถ้ามี) */}
            <div className="summary-row">
              <span>ค่าจัดส่ง</span>
              <span>0 THB</span> {/* หรือคำนวณตามจริง */}
            </div>
            <hr />
            {/* --- ใช้ cartTotal เป็นยอดรวมสุดท้าย --- */}
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