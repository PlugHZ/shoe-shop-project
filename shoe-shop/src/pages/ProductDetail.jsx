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

  //ฟังก์ชันลบสินค้า (เฉพาะ admin)
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

      alert(" สินค้าถูกลบสำเร็จ!");
      navigate("/");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(` ไม่สามารถลบสินค้าได้: ${error.message}`);
      setLoading(false);
    }
  };

  // เพิ่มสินค้าในตะกร้า
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

  return (
    <div className="product-detail-container container">
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

        <div className="quantity-selector">
          <p>จำนวน:</p>
          <div className="quantity-controls">
            <button
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              disabled={quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = Math.max(
                  1,
                  Math.min(product.stock, Number(e.target.value))
                );
                setQuantity(val);
              }}
              min="1"
              max={product.stock} // จำกัดไม่ให้เกินสต็อก
              readOnly // แนะนำให้ใช้ปุ่มเท่านั้น
            />
            <button
              onClick={() =>
                setQuantity((prev) => Math.min(product.stock, prev + 1))
              }
              disabled={quantity >= product.stock} // ห้ามกดเพิ่มเมื่อเต็มสต็อก
            >
              +
            </button>
          </div>
          {product.stock === 0 && <p className="stock-out">สินค้าหมดสต็อก</p>}
          {product.stock > 0 && (
            <p className="stock-info">({product.stock} ชิ้นในสต็อก)</p>
          )}
        </div>

        <div className="action-buttons">
          {/*ปุ่มเพิ่มในตะกร้า (หลัก) */}
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={
              !selectedSize || quantity > product.stock || product.stock === 0
            }
          >
            เพิ่มลงตะกร้า ({quantity})
          </button>
        </div>

        <div className="product-description">
          <h3>รายละเอียดสินค้า</h3>
          <p>{product.description || "ไม่มีรายละเอียดสินค้า"}</p>
        </div>

        {/*แสดงปุ่มลบเฉพาะ admin */}
        {user?.role === "admin" && (
          <div className="admin-actions">
            {/*ปุ่มแก้ไข */}
            <Link to={`/product/edit/${id}`} style={{ textDecoration: "none" }}>
              <button className="edit-product-btn" disabled={loading}>
                แก้ไขสินค้า
              </button>
            </Link>

            {/*ปุ่มลบ */}
            <button
              className="delete-btn"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "กำลังลบ..." : "ลบสินค้า"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
