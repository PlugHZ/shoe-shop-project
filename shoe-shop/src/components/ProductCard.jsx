import React from "react";
import "./ProductCard.css";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  // ตรวจสอบว่า product.image_urls เป็น Array
  const rawImageUrls = product?.image_urls || [];

  // ถ้า Array แรกเป็น Array ซ้อน ให้ใช้ [0][0] แต่ถ้าเป็น Array ปกติ ให้ใช้ [0]
  const imageUrl =
    Array.isArray(rawImageUrls) && rawImageUrls.length > 0
      ? Array.isArray(rawImageUrls[0])
        ? rawImageUrls[0][0]
        : rawImageUrls[0]
      : "/images/placeholder.png";

  return (
    <Link to={`/product/${product.id}`} className="product-card-link">
      <div className="product-card">
        <div className="product-image-container">
          <img
            src={imageUrl} // ใช้ imageUrl ที่ประมวลผลแล้ว
            alt={product.name}
            className="product-image"
          />
          {product.saleBadge && (
            <div className="sale-badge">{product.saleBadge}</div>
          )}
        </div>

        <div className="product-info">
          {product.brand && <p className="product-brand">{product.brand}</p>}
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">{product.price.toLocaleString()} THB</p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
