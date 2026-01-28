import React, { useState, useEffect } from "react";
import "./AdminOrders.css";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders`,
      );
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!window.confirm(`เปลี่ยนสถานะออเดอร์ #${orderId} เป็น "${newStatus}"?`))
      return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) throw new Error("Failed to update status");

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "shipped":
        return "status-shipped";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  if (loading)
    return <div className="admin-container loading">กำลังโหลด...</div>;
  if (error) return <div className="admin-container error">{error}</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>จัดการคำสั่งซื้อ ({orders.length})</h1>
      </div>

      <div className="table-responsive">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>ลูกค้า</th>
              <th>ที่อยู่จัดส่ง</th>
              <th>วันที่สั่งซื้อ</th>
              <th>ยอดรวม</th>
              <th>สถานะปัจจุบัน</th>
              <th>จัดการสถานะ</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  ไม่มีคำสั่งซื้อ
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td data-label="Order ID">#{order.id}</td>

                  <td data-label="ลูกค้า">
                    <div className="customer-info">
                      <strong>
                        {order.customer_name || `User ${order.user_id}`}
                      </strong>
                      <span className="text-muted">{order.phone}</span>
                    </div>
                  </td>

                  <td data-label="ที่อยู่จัดส่ง" className="address-cell">
                    {order.shipping_address || "ไม่ระบุที่อยู่"}
                  </td>

                  <td data-label="วันที่สั่งซื้อ">
                    {new Date(order.created_at).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td data-label="ยอดรวม" className="amount-cell">
                    {Number(order.total_price).toLocaleString()} ฿
                  </td>

                  <td data-label="สถานะ">
                    <span
                      className={`badge-status ${getStatusClass(order.status || "pending")}`}
                    >
                      {order.status || "pending"}
                    </span>
                  </td>

                  <td data-label="จัดการ">
                    <select
                      className="status-select"
                      value={order.status || "pending"}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                    >
                      <option value="pending">รอดำเนินการ</option>
                      <option value="shipped">จัดส่งแล้ว</option>
                      <option value="completed">สำเร็จ</option>
                      <option value="cancelled">ยกเลิก</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
