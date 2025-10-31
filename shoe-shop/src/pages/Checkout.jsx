import React, { useState } from 'react';
import { useCart } from '../context/CartContext'; // ดึงข้อมูลตะกร้ามาแสดงสรุป
import './Checkout.css';

const Checkout = () => {
  const { cartItems, cartTotal } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    //จุดนี้คือส่วนที่เราจะส่งข้อมูล Order ไปที่ Backend ในอนาคต
    console.log("Order Data:", {
      customerInfo: formData,
      items: cartItems,
      total: cartTotal,
    });
    alert('คำสั่งซื้อของคุณถูกส่งแล้ว! (จำลอง)');
    // หลังจากส่ง Order สำเร็จ อาจจะเคลียร์ตะกร้า หรือพาไปหน้า Thank You
  };

  return (
    <div className="checkout-container container">
      <h1>ข้อมูลการจัดส่ง</h1>
      <div className="checkout-layout">
        {/* ฟอร์มกรอกข้อมูล */}
        <form className="shipping-form" onSubmit={handleSubmitOrder}>
          <h2>ที่อยู่สำหรับจัดส่ง</h2>
          <div className="form-group">
            <label htmlFor="name">ชื่อ-นามสกุล</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="address">ที่อยู่</label>
            <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="phone">เบอร์โทรศัพท์</label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
          </div>
          <button type="submit" className="place-order-btn">ยืนยันคำสั่งซื้อ</button>
        </form>

        {/* ส่วนสรุปยอดสั่งซื้อ (เหมือนในหน้า Cart) */}
        <div className="order-summary-checkout">
          <h2>สรุปรายการ</h2>
          {cartItems.map(item => (
            <div key={`${item.id}-${item.size}`} className="summary-item">
              <img src={item.images[0]} alt={item.name} />
              <div className="item-info">
                <span>{item.name} (x{item.quantity})</span>
                <span>Size: {item.size}</span>
              </div>
              <span className="item-price">{(item.price * item.quantity).toLocaleString()} THB</span>
            </div>
          ))}
          <hr />
          <div className="summary-total">
            <span>ยอดรวม</span>
            <span>{cartTotal.toLocaleString()} THB</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;