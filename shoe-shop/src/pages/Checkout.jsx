import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

const Checkout = () => {
  const { cartItems, cartTotal, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      user_id: user ? user.id : null,
      customer_name: formData.name,
      shipping_address: formData.address,
      phone: formData.phone,
      total_price: cartTotal,
      items: cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        price_at_purchase: item.price,
      })),
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        },
      );
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to place order");
      }

      if (user) {
        await fetchCart();
      }

      navigate("/order-success", {
        state: { orderId: resData.orderId || resData.insertId },
      });
    } catch (err) {
      console.error("Error placing order:", err);
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container container">
      <h1>ข้อมูลการจัดส่ง</h1>
      <div className="checkout-layout">
        <form className="shipping-form" onSubmit={handleSubmitOrder}>
          <h2>ที่อยู่สำหรับจัดส่ง</h2>
          <div className="form-group">
            <label htmlFor="name">ชื่อ-นามสกุล</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">ที่อยู่</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">เบอร์โทรศัพท์</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <button
            type="submit"
            className="place-order-btn"
            disabled={loading || cartItems.length === 0}
          >
            {loading ? "กำลังดำเนินการ..." : "ยืนยันคำสั่งซื้อ"}
          </button>
        </form>

        <div className="order-summary-checkout">
          <h2>สรุปรายการ</h2>
          {cartItems.map((item) => (
            <div key={item.id} className="summary-item">
              <img
                src={item.images?.[0] || "/images/placeholder.png"}
                alt={item.name}
              />
              <div className="item-info">
                <span>
                  {item.name} (x{item.quantity})
                </span>
                <span>Size: {item.size}</span>
              </div>
              <span className="item-price">
                {(item.price * item.quantity).toLocaleString()} THB
              </span>
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
