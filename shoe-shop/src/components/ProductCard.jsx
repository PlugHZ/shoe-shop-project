import React from 'react';
import './ProductCard.css'; 
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const imageUrl = product?.images?.[0] || '/images/placeholder.png';
  return (
    <Link to={`/product/${product.id}`} className="product-card-link">
    <div className="product-card">
      {product.sale && <div className="sale-badge">{product.sale}</div>}
      <div className="product-image-wrapper">
        <img src={imageUrl} alt={product.name} className="product-image" />
        {/* ถ้ามี saleBadge ให้แสดงป้ายลดราคา */}
        {product.saleBadge && <div className="sale-badge">{product.saleBadge}</div>}
      </div>
      <div className="product-info">
        <p className="product-brand">{product.brand}</p> {/* ส่วนแสดงแบรนด์ */}
        <h3 className="product-name">{product.name}</h3> {/* ชื่อสินค้า */}
        <p className="product-price">{product.price.toLocaleString()} THB</p> {/* ราคา */}
      </div>
      </div>
    </Link>
  );
};

export default ProductCard;