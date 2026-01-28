import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AdminProductList.css";

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ดึงข้อมูลสินค้าทั้งหมด
  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products`,
      );
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถโหลดข้อมูลสินค้าได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ฟังก์ชันลบสินค้า
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        `คุณแน่ใจหรือไม่ที่จะลบสินค้ารหัส ${id}? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete product");
      }

      // ลบสำเร็จอัปเดต State หน้าจอโดยเอาสินค้านั้นออก
      setProducts(products.filter((product) => product.id !== id));
      alert("ลบสินค้าสำเร็จ!");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(`เกิดข้อผิดพลาดในการลบ: ${err.message}`);
    }
  };

  //  HelperดึงURLรูปภาพ
  const getImageUrl = (product) => {
    const images = product.image_urls || product.images || [];
    let firstImage = Array.isArray(images[0]) ? images[0][0] : images[0];

    if (!firstImage || typeof firstImage !== "string") {
      return "/images/placeholder.png";
    }
    if (firstImage.startsWith("http")) return firstImage;
    return `${import.meta.env.VITE_API_URL}/${firstImage.startsWith("/") ? firstImage.slice(1) : firstImage}`;
  };

  if (loading)
    return <div className="admin-container loading">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="admin-container error">{error}</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>จัดการสินค้า ({products.length} รายการ)</h1>
        <Link to="/admin/add-product" className="btn-add-new">
          + เพิ่มสินค้าใหม่
        </Link>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>รูปภาพ</th>
              <th>ชื่อสินค้า</th>
              <th>หมวดหมู่</th>
              <th>ราคา</th>
              <th>สต็อก</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  ไม่มีสินค้าในระบบ
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>#{product.id}</td>
                  <td>
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="product-thumbnail"
                    />
                  </td>
                  <td className="product-name-cell">
                    <strong>{product.name}</strong>
                    <br />
                    <small>{product.brand}</small>
                  </td>
                  <td>
                    <span className="badge-category">{product.category}</span>
                  </td>
                  <td>{Number(product.price).toLocaleString()} ฿</td>
                  <td>
                    <span
                      className={`badge-stock ${product.stock < 5 ? "low-stock" : ""} ${product.stock === 0 ? "out-of-stock" : ""}`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/product/edit/${product.id}`}
                        className="admin-btn-edit"
                      >
                        แก้ไข
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="admin-btn-delete"
                      >
                        ลบ
                      </button>
                    </div>
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

export default AdminProductList;
