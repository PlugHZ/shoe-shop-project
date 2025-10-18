import React from 'react';
import './ProductCard.css'; // ตรวจสอบว่า import CSS ถูกต้อง

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img src={product.imageUrl} alt={product.name} className="product-image" />
        {/* ถ้ามี saleBadge ให้แสดงป้ายลดราคา */}
        {product.saleBadge && <div className="sale-badge">{product.saleBadge}</div>}
      </div>
      <div className="product-info">
        <p className="product-brand">{product.brand}</p> {/* เพิ่มส่วนแสดงแบรนด์ */}
        <h3 className="product-name">{product.name}</h3> {/* ชื่อสินค้า */}
        <p className="product-price">{product.price.toLocaleString()} THB</p> {/* ราคา */}
      </div>
    </div>
  );
};

export default ProductCard;