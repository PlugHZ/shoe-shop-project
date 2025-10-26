import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { products } from '../data/mockData'; // Import ข้อมูลจำลอง
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams(); // ดึง id จาก URL

  // ค้นหาสินค้า ก่อน
  const product = products.find(p => p.id == id);

  // สร้าง state *หลังจาก* หาสินค้าเจอ (หรือใช้ null ไปก่อน)
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null); // เริ่มต้นด้วย null
  const [mainImage, setMainImage] = useState(null); // เริ่มต้นด้วย null

  //  ใช้ useEffect เพื่อกำหนดค่า size และ image เริ่มต้น *หลังจาก* ที่แน่ใจว่ามี product แล้ว
  useEffect(() => {
    if (product) {
      // ใช้ optional chaining (?.) เผื่อ product ไม่มี sizes/images และกำหนดค่าเริ่มต้นเป็น null
      setSelectedSize(product.sizes?.[0] || null); 
      setMainImage(product.images?.[0] || null); 
    }
  }, [product]); 

  //  จัดการกรณี "ไม่พบสินค้า" ตั้งแต่เนิ่นๆ
  if (!product) {
    return <h2 className="container">ไม่พบสินค้า</h2>;
  }

  // ตรวจสอบให้แน่ใจว่า sizes และ images มีอยู่จริง ก่อนจะ map
  const availableSizes = product.sizes || [];
  const availableImages = product.images || [];

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
              className={mainImage === img ? 'active' : ''}
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
        <p className="status">สถานะของสินค้า : {product.status || 'N/A'}</p>
        <p className="price">{product.price.toLocaleString()} THB</p>
        <div className="size-selector">
          <p>Size :</p>
          <div className="sizes">
            {availableSizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={selectedSize === size ? 'active' : ''}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <div className="quantity-selector">
          <p>จำนวน</p>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
            min="1"
          />
        </div>
        <button className="add-to-cart-btn">
          เพิ่มไปยังตะกร้า
        </button>
        <div className="product-description">
          <h3>รายละเอียด</h3>
          <p>{product.description || 'ไม่มีรายละเอียด'}</p>
          <p>SKU: {product.sku || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;