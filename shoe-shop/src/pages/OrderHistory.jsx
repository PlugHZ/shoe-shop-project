import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./OrderHistory.css";

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/user/${user.id}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  // IMAGE URL
  const getImageUrl = (item) => {
    const img =
      item.image || // backend ปัจจุบัน
      item.image_url || // เผื่อ snake_case
      item.imageUrl || // เผื่อ camelCase
      item.productImage || // เผื่อชื่ออื่น
      item.img; // กันพลาด

    if (!img || typeof img !== "string") {
      return "/images/placeholder.png";
    }

    // ถ้าเป็น URL ภายนอก
    if (img.startsWith("http")) {
      return img;
    }

    // ถ้าเป็น path จาก backend
    const cleanPath = img.startsWith("/") ? img.slice(1) : img;
    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
  };

  const handleImageError = (e) => {
    e.target.src = "/images/placeholder.png";
    e.target.onerror = null;
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: "2rem" }}>
        กรุณาเข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: "2rem" }}>
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="order-history-container container">
      <h1>ประวัติการสั่งซื้อ</h1>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>คุณยังไม่มีประวัติการสั่งซื้อ</p>
          <Link to="/" className="btn-shop-now">
            เลือกซื้อสินค้าเลย
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              {/* HEADER */}
              <div className="order-header">
                <div className="order-meta">
                  <h3>คำสั่งซื้อ #{order.id}</h3>
                  <span className="order-date">
                    {new Date(order.date).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div
                  className={`order-status status-${
                    order.status ? order.status.toLowerCase() : "pending"
                  }`}
                >
                  {order.status === "pending" ? "รอดำเนินการ" : order.status}
                </div>
              </div>

              {/* ITEMS */}
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img
                      src={getImageUrl(item)}
                      alt={item.name}
                      onError={handleImageError}
                      className="order-item-img"
                    />

                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>
                        ไซส์: {item.size} | จำนวน: {item.quantity}
                      </p>
                    </div>

                    <div className="item-price">
                      {(item.price * item.quantity).toLocaleString()} THB
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="order-footer">
                <span>ยอดสุทธิ</span>
                <span className="total-price">
                  {Number(order.total).toLocaleString()} THB
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
