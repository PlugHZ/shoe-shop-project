import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth(); // ✅ ใช้ตรวจสอบสิทธิ์ admin
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  // 🔹 โหลดข้อมูลสินค้า
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/api/products/${id}`
        );
        if (!response.ok) throw new Error("Product not found");

        const data = await response.json();
        setProduct(data);

        // ตั้งรูปแรกเป็นภาพหลัก
        let firstImage = null;
        if (data.image_urls && data.image_urls.length > 0) {
          firstImage = Array.isArray(data.image_urls[0])
            ? data.image_urls[0][0]
            : data.image_urls[0];
        }

        setSelectedSize(data.sizes?.[0] || null);
        setMainImage(firstImage || null);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // 🔹 ฟังก์ชันลบสินค้า (เฉพาะ admin)
  const handleDelete = async () => {
    if (
      !window.confirm(
        `คุณแน่ใจหรือไม่ที่จะลบสินค้า: ${product.name} (ID: ${product.id})?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete product");
      }

      alert("✅ สินค้าถูกลบสำเร็จ!");
      navigate("/");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(`❌ ไม่สามารถลบสินค้าได้: ${error.message}`);
      setLoading(false);
    }
  };

  // 🔹 เพิ่มสินค้าในตะกร้า
  const handleAddToCart = () => {
    if (!selectedSize && product.sizes.length > 0) {
      alert("กรุณาเลือกไซส์!");
      return;
    }
    addToCart(product, quantity, selectedSize || "N/A");
    navigate("/cart");
  };

  // 🔹 Loading & Error state
  if (loading)
    return (
      <h2 className="container" style={{ padding: "3rem 0" }}>
        กำลังโหลด...
      </h2>
    );
  if (!product)
    return (
      <h2 className="container" style={{ padding: "3rem 0" }}>
        ไม่พบสินค้า
      </h2>
    );

  const availableSizes = product.sizes || [];
  const rawImages = product.image_urls || [];
  const availableImages = Array.isArray(rawImages[0])
    ? rawImages[0]
    : rawImages;

  // 🔹 ส่วนแสดงผล
  return (
    <div className="product-detail-container container">
      {/* 🖼️ แกลเลอรี่รูปภาพ */}
      <div className="image-gallery">
        <div className="thumbnails">
          {availableImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${product.name} thumbnail ${index + 1}`}
              onClick={() => setMainImage(img)}
              className={mainImage === img ? "active" : ""}
            />
          ))}
        </div>
        <div className="main-image">
          {mainImage && <img src={mainImage} alt={product.name} />}
        </div>
      </div>

      {/* ℹ️ ข้อมูลสินค้า */}
      <div className="product-info-details">
        <p className="brand">{product.brand}</p>
        <h1>{product.name}</h1>
        <p className="status">
          สถานะของสินค้า : {product.status || "สินค้าพร้อมส่ง"}
        </p>
        <p className="price">{product.price.toLocaleString()} THB</p>

        {availableSizes.length > 0 && (
          <div className="size-selector">
            <p>Size :</p>
            <div className="sizes">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={selectedSize === size ? "active" : ""}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="quantity-selector">{/* ... */}</div>

        <button className="add-to-cart-btn" onClick={handleAddToCart}>
          เพิ่มไปยังตะกร้า
        </button>

        {/* 🔐 แสดงปุ่มลบเฉพาะ admin */}
        {user?.role === "admin" && (
          <button
            className="delete-btn"
            onClick={handleDelete}
            disabled={loading}
            style={{
              marginTop: "10px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {loading ? "กำลังลบ..." : "ลบสินค้า (Admin)"}
          </button>
        )}

        <div className="product-description">{/* ... */}</div>
      </div>
    </div>
  );
};

export default ProductDetail;
