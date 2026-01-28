import React from "react";
import { Link } from "react-router-dom";
import { FiPackage, FiPlusSquare, FiClipboard, FiHome } from "react-icons/fi";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  return (
    <div className="admin-container dashboard-page">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>ยินดีต้อนรับสู่ระบบจัดการร้านค้าหลังบ้าน</p>
      </div>

      <div className="dashboard-grid">
        {/*  จัดการสินค้า */}
        <Link to="/admin/products" className="dashboard-card">
          <div className="card-icon">
            <FiPackage />
          </div>
          <h3>จัดการสินค้า</h3>
          <p>ดูสต็อก, แก้ไขราคา, ลบสินค้า</p>
        </Link>

        {/* เพิ่มสินค้าใหม่ */}
        <Link to="/admin/add-product" className="dashboard-card">
          <div className="card-icon">
            <FiPlusSquare />
          </div>
          <h3>เพิ่มสินค้าใหม่</h3>
          <p>ลงขายสินค้าชิ้นใหม่</p>
        </Link>

        {/*  จัดการคำสั่งซื้อ */}
        <Link to="/admin/orders" className="dashboard-card">
          <div className="card-icon">
            <FiClipboard />
          </div>
          <h3>จัดการคำสั่งซื้อ</h3>
          <p>ดูรายการสั่งซื้อ, อัปเดตสถานะจัดส่ง</p>
        </Link>

        {/* กลับหน้าร้าน */}
        <Link to="/" className="dashboard-card back-home">
          <div className="card-icon">
            <FiHome />
          </div>
          <h3>กลับหน้าร้านค้า</h3>
          <p>ไปที่หน้า Home ฝั่งลูกค้า</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
