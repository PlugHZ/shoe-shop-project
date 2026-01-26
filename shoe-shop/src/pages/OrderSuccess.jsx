import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiCheckCircle, FiHome, FiShoppingBag } from "react-icons/fi";
import "./OrderSuccess.css";

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="order-success-container container">
      <div className="success-card">
        <FiCheckCircle className="success-icon" size={80} />

        <h1>ขอบคุณสำหรับการสั่งซื้อ!</h1>
        <p className="success-message">
          เราได้รับข้อมูลคำสั่งซื้อของคุณเรียบร้อยแล้ว <br />
          สินค้าจะถูกจัดส่งไปยังที่อยู่ที่คุณระบุไว้โดยเร็วที่สุด
        </p>

        {orderId && (
          <div className="order-info">
            <p>หมายเลขคำสั่งซื้อของคุณคือ:</p>
            <h2 className="order-id">#{orderId}</h2>
          </div>
        )}

        <div className="action-buttons">
          <Link to="/" className="btn btn-primary">
            <FiHome className="btn-icon" /> กลับหน้าแรก
          </Link>
          <Link to="/orders" className="btn btn-secondary">
            <FiShoppingBag className="btn-icon" /> ดูประวัติการสั่งซื้อ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
