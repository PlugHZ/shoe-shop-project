import React, { useState, useEffect } from "react";
import "./AdminOrders.css";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ฟังก์ชันช่วยเช็ค URL รูปภาพ
  const getSlipUrl = (imageName) => {
    if (!imageName) return null;
    if (imageName.startsWith("http")) return imageName;
    return `${import.meta.env.VITE_API_URL}/uploads/${imageName}`;
  };

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

  const handleStatusChange = async (orderId, newValue, field = "status") => {
    const confirmMessage =
      field === "payment_status" && newValue === "paid"
        ? "ยืนยันว่าเงินเข้าบัญชีถูกต้องแล้ว ใช่หรือไม่?"
        : `เปลี่ยนสถานะเป็น "${newValue}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      // สร้าง Body ตามประเภทที่จะส่ง
      const bodyData =
        field === "payment_status"
          ? { payment_status: newValue }
          : { status: newValue };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        },
      );

      if (!response.ok) throw new Error("Failed to update status");

      // อัปเดต State หน้าเว็บทันที
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === orderId) {
            // อัปเดตเฉพาะ field ที่เปลี่ยน
            return { ...order, [field]: newValue };
          }
          return order;
        }),
      );
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "processing":
        return "status-pending";
      case "shipped":
        return "status-shipped";
      case "delivered":
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
              <th>ยอดรวม</th>
              <th>การชำระเงิน / สลิป</th>
              <th>สถานะการเงิน</th>
              <th>สถานะจัดส่ง</th>
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

                  <td data-label="ยอดรวม" className="amount-cell">
                    {Number(order.total_price).toLocaleString()} ฿
                  </td>

                  <td data-label="การชำระเงิน">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <span
                        className={`badge-payment ${order.payment_method === "cod" ? "cod" : "transfer"}`}
                        style={{
                          fontSize: "0.8rem",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background:
                            order.payment_method === "cod"
                              ? "#eab308"
                              : "#3b82f6",
                          color: "#000",
                          fontWeight: "bold",
                        }}
                      >
                        {order.payment_method === "cod"
                          ? "ปลายทาง (COD)"
                          : "โอนเงิน"}
                      </span>

                      {order.slip_image ? (
                        <a
                          href={getSlipUrl(order.slip_image)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={getSlipUrl(order.slip_image)}
                            alt="สลิป"
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "5px",
                              border: "1px solid #555",
                              cursor: "pointer",
                            }}
                          />
                        </a>
                      ) : (
                        order.payment_method !== "cod" && (
                          <span style={{ color: "red", fontSize: "0.8rem" }}>
                            ไม่มีสลิป
                          </span>
                        )
                      )}
                    </div>
                  </td>

                  {/* สถานะการเงิน  ปุ่มยืนยัน */}
                  <td data-label="สถานะการเงิน">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      {/* โชว์สถานะปัจจุบัน */}
                      <span
                        style={{
                          fontWeight: "bold",
                          color:
                            order.payment_status === "paid"
                              ? "green"
                              : "orange",
                        }}
                      >
                        {order.payment_status === "paid"
                          ? "ชำระเงินแล้ว"
                          : "รอตรวจสอบ"}
                      </span>

                      {/* ปุ่มกด Confirm (โชว์เมื่อยังไม่จ่าย และไม่ใช่ COD) */}
                      {order.payment_status === "pending" &&
                        order.payment_method !== "cod" && (
                          <button
                            onClick={() =>
                              handleStatusChange(
                                order.id,
                                "paid",
                                "payment_status",
                              )
                            }
                            style={{
                              backgroundColor: "#facc15",
                              color: "#000",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "0.8rem",
                            }}
                          >
                            ยืนยันยอดเงิน
                          </button>
                        )}
                    </div>
                  </td>

                  {/* สถานะจัดส่ง (Dropdown) */}
                  <td data-label="สถานะจัดส่ง">
                    <select
                      className={`status-select ${getStatusClass(order.status)}`}
                      value={order.status || "processing"}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value, "status")
                      }
                    >
                      <option value="processing">กำลังเตรียมสินค้าของ</option>
                      <option value="shipped">จัดส่งแล้ว</option>
                      <option value="delivered">ได้รับสินค้าแล้ว</option>
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
