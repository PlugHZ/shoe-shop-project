import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import generatePayload from "promptpay-qr";
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
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const PROMPTPAY_ID = import.meta.env.VITE_PROMPTPAY_NUMBER || "";

  const qrPayload = useMemo(() => {
    if (!PROMPTPAY_ID || cartTotal <= 0) return "";
    try {
      const cleanId = PROMPTPAY_ID.replace(/-/g, "");
      return generatePayload(cleanId, { amount: Number(cartTotal) });
    } catch (err) {
      console.error("QR Gen Error:", err);
      return "";
    }
  }, [PROMPTPAY_ID, cartTotal]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipFile(file);
      const objectUrl = URL.createObjectURL(file);
      setSlipPreview(objectUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (slipPreview) URL.revokeObjectURL(slipPreview);
    };
  }, [slipPreview]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (paymentMethod === "transfer" && !slipFile) {
      alert("กรุณาแนบสลิปการโอนเงิน");
      return;
    }
    setLoading(true);

    try {
      const data = new FormData();
      data.append("user_id", user ? user.id : null);
      data.append("customer_name", formData.name);
      data.append("shipping_address", formData.address);
      data.append("phone", formData.phone);
      data.append("total_price", cartTotal);
      data.append("payment_method", paymentMethod);
      data.append(
        "items",
        JSON.stringify(
          cartItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            size: item.size,
            price_at_purchase: item.price,
            image: item.images?.[0] || null,
          })),
        ),
      );

      if (slipFile) {
        data.append("slip_image", slipFile);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        {
          method: "POST",
          body: data,
        },
      );

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "เกิดข้อผิดพลาดในการสั่งซื้อ");
      }

      if (user) await fetchCart();
      navigate("/order-success", { state: { orderId: resData.orderId } });
    } catch (err) {
      alert("❌ ไม่สามารถสั่งซื้อได้: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container container">
      <h1>ชำระเงิน</h1>
      <div className="checkout-layout">
        <form className="shipping-form" onSubmit={handleSubmitOrder}>
          <div className="form-group">
            <label>ชื่อ-นามสกุล</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>ที่อยู่</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>เบอร์โทร</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div
            className="payment-section"
            style={{
              marginTop: "20px",
              borderTop: "1px solid #444",
              paddingTop: "20px",
            }}
          >
            <h3 style={{ color: "white" }}>วิธีการชำระเงิน</h3>
            <div
              style={{
                display: "flex",
                gap: "15px",
                margin: "10px 0",
                color: "white",
              }}
            >
              <label style={{ cursor: "pointer" }}>
                <input
                  type="radio"
                  value="transfer"
                  checked={paymentMethod === "transfer"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />{" "}
                โอนเงิน (QR)
              </label>
              <label style={{ cursor: "pointer" }}>
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />{" "}
                เก็บเงินปลายทาง
              </label>
            </div>

            {paymentMethod === "transfer" && (
              <div
                style={{
                  background: "white",
                  padding: "15px",
                  borderRadius: "8px",
                  textAlign: "center",
                  color: "black",
                }}
              >
                <div
                  style={{
                    height: "auto",
                    margin: "0 auto",
                    maxWidth: 200,
                    width: "100%",
                  }}
                >
                  {qrPayload ? (
                    <QRCode
                      size={256}
                      style={{
                        height: "auto",
                        maxWidth: "100%",
                        width: "100%",
                      }}
                      value={qrPayload}
                      viewBox={`0 0 256 256`}
                    />
                  ) : (
                    <p style={{ color: "red" }}>
                      ไม่พบข้อมูล PromptPay หรือยอดเงิน
                    </p>
                  )}
                </div>
                <p style={{ fontWeight: "bold", marginTop: "10px" }}>
                  ยอดโอน {cartTotal.toLocaleString()} บาท
                </p>

                <div style={{ marginTop: "15px", textAlign: "left" }}>
                  <label style={{ fontWeight: "bold" }}>แนบสลิป:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                </div>

                {slipPreview && (
                  <div
                    style={{
                      marginTop: "10px",
                      textAlign: "center",
                      border: "2px dashed #ccc",
                      padding: "10px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#666",
                        marginBottom: "5px",
                      }}
                    >
                      ตัวอย่างสลิป:
                    </p>
                    <img
                      src={slipPreview}
                      alt="Slip Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "250px",
                        borderRadius: "5px",
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="place-order-btn" disabled={loading}>
            {loading ? "กำลังบันทึก..." : "ยืนยันคำสั่งซื้อ"}
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
