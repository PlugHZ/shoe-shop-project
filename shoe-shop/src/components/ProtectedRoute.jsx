import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ requireAdmin }) => {
  const { user, loading } = useAuth();

  // ถ้ากำลังโหลดข้อมูลUserอยู่ให้รอแป๊บนึง(กันดีดมั่ว)
  if (loading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
        Checking permissions...
      </div>
    );
  }

  // ถ้ายังไม่ล็อกอินย้ายไปหน้า Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  //ถ้าหน้านี้ต้องการ Admin แต่คนloginไม่ใช่ Adminย้ายกลับไปหน้าแรก
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // ถ้าผ่านทุกด่านอนุญาตให้เข้าถึงเนื้อหาข้างใน
  return <Outlet />;
};

export default ProtectedRoute;
