import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/${id}`,
        );
        if (!response.ok) throw new Error("Product not found");

        const data = await response.json();
        setProduct(data);

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

  const handleDelete = async () => {
    if (
      !window.confirm(
        `คุณแน่ใจหรือไม่ที่จะลบสินค้า: ${product.name} (ID: ${product.id})?`,
      )
    ) {
      return;
    }

    setLoading(true);
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

      alert("สินค้าถูกลบสำเร็จ!");
      navigate("/");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(`ไม่สามารถลบสินค้าได้: ${error.message}`);
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes.length > 0) {
      alert("กรุณาเลือกไซส์!");
      return;
    }
    addToCart(product, quantity, selectedSize || "N/A");
    navigate("/cart");
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h2>กำลังโหลดข้อมูลสินค้า...</h2>
      </div>
    );
  if (!product)
    return (
      <div className="error-container">
        <h2>ไม่พบสินค้าที่คุณค้นหา</h2>
        <Link to="/" className="back-btn">
          กลับสู่หน้าหลัก
        </Link>
      </div>
    );

  const availableSizes = product.sizes || [];
  const rawImages = product.image_urls || [];
  const availableImages = Array.isArray(rawImages[0])
    ? rawImages[0]
    : rawImages;

  return (
    <div className="product-detail-page">
      <div className="product-detail-card">
        {/* โซนรูปภาพ  */}
        <div className="image-gallery">
          <div className="main-image">
            {mainImage ? (
              <img src={mainImage} alt={product.name} />
            ) : (
              <div className="no-image">No Image</div>
            )}
          </div>
          <div className="thumbnails">
            {availableImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`thumb-${index}`}
                onClick={() => setMainImage(img)}
                className={mainImage === img ? "active" : ""}
              />
            ))}
          </div>
        </div>

        {/* โซนข้อมูลสินค้า */}
        <div className="product-info-details">
          <div className="product-header">
            <p className="brand">{product.brand}</p>
            <h1>{product.name}</h1>
            <div className="price-tag">
              {Number(product.price).toLocaleString()} <small>THB</small>
            </div>
            {product.category && (
              <span className="category-badge">{product.category}</span>
            )}
          </div>

          <div className="divider"></div>

          {/* เลือกไซส์ */}
          {availableSizes.length > 0 && (
            <div className="selector-group">
              <p className="label">เลือกไซส์:</p>
              <div className="size-options">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`size-btn ${selectedSize === size ? "selected" : ""}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* เลือกจำนวน */}
          <div className="selector-group">
            <p className="label">จำนวน:</p>
            <div className="quantity-wrapper">
              <div className="quantity-controls">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input type="text" value={quantity} readOnly />
                <button
                  onClick={() =>
                    setQuantity((prev) => Math.min(product.stock, prev + 1))
                  }
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <span className="stock-label">มีสินค้า {product.stock} ชิ้น</span>
            </div>
          </div>

          <div className="divider"></div>

          {/* รายละเอียด */}
          <div className="product-description">
            <h3>รายละเอียดสินค้า</h3>
            <p>{product.description || "ไม่มีรายละเอียดเพิ่มเติม"}</p>
          </div>

          {/* Admin Actions (ปุ่มแก้ไข/ลบ) */}
          {user?.role === "admin" && (
            <div className="admin-section">
              <h3>Admin Management</h3>
              <div className="admin-actions">
                <Link to={`/product/edit/${id}`} className="admin-btn edit">
                  ✏️ แก้ไขสินค้า
                </Link>
                <button onClick={handleDelete} className="admin-btn delete">
                  🗑️ ลบสินค้า
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile */}
      <div className="sticky-footer-bar">
        <button
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={
            !selectedSize || quantity > product.stock || product.stock === 0
          }
        >
          {product.stock === 0
            ? "สินค้าหมด"
            : `เพิ่มลงตะกร้า • ฿${(product.price * quantity).toLocaleString()}`}
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
