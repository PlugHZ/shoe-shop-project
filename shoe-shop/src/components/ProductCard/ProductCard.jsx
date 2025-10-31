// src/components/ProductCard/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css'; // เราจะสร้างไฟล์นี้ในขั้นตอนถัดไป

const ProductCard = ({ product }) => {
  return (
    // เมื่อคลิกการ์ด จะลิงก์ไปที่หน้า ProductDetail
    <Link to={`/product/${product.id}`} className="product-card">
      
      {/* ส่วนแสดงรูปภาพ (เดี๋ยวใส่ทีหลัง) */}
      <div className="product-image-placeholder">
        <span>(เดี๋ยวใส่รูปทีหลัง)</span>
      </div>

      {/* ส่วนแสดงข้อมูลสินค้า */}
      <div className="product-info">
        <span className="product-brand">{product.brand}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">{product.price}</p>
      </div>
    </Link>
  );
};

export default ProductCard;