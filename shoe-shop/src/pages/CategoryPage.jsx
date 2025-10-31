// src/pages/CategoryPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

// --- 1. Import สิ่งที่เราสร้างใหม่ ---
import ProductCard from '../components/ProductCard/ProductCard.jsx';
import './CategoryPage.css'; // Import CSS สำหรับ Grid

// --- 2. สร้างข้อมูลจำลอง (Mock Data) ---
// (อนาคตส่วนนี้จะมาจากการดึง API หรือ Firebase)
// เราจะสร้าง 24 รายการ (4 คอลัมน์ x 6 แถว)
const mockFootballBoots = [];
const baseProducts = [
  { name: 'Nike Mercurial Superfly 9', price: '9,500 THB', brand: 'NIKE' },
  { name: 'Adidas Predator Accuracy.1', price: '8,500 THB', brand: 'ADIDAS' },
  { name: 'Puma Future Ultimate', price: '7,900 THB', brand: 'PUMA' },
  { name: 'Mizuno Morelia Neo IV', price: '7,200 THB', brand: 'MIZUNO' }
];

// วนลูป 6 รอบ เพื่อสร้าง 6 แถว (6 * 4 = 24)
for (let i = 0; i < 6; i++) {
  baseProducts.forEach((base, index) => {
    const id = (i * 4) + index + 1;
    mockFootballBoots.push({
      id: id, // ID สำหรับ Link
      brand: base.brand,
      name: `${base.name} #${id}`, // ใส่เลขเพื่อให้ชื่อไม่ซ้ำ
      price: base.price
    });
  });
}
// ตอนนี้ mockFootballBoots จะมี 24 รายการ

// (เผื่อไว้สำหรับหมวดหมู่อื่น)
const mockFutsalBoots = [
  { id: 101, brand: 'BREAKER', name: 'BREAKER COBRA 13', price: '2,350 THB' },
  // ... (เพิ่มได้ตามต้องการ)
];


const CategoryPage = () => {
  const { categoryName } = useParams();

  // --- 3. เลือกข้อมูลที่จะแสดงตาม URL ---
  let productsToShow = [];
  let pageTitle = "ไม่พบหมวดหมู่";

  if (categoryName === 'football') {
    productsToShow = mockFootballBoots;
    pageTitle = "รองเท้าฟุตบอล";
  } else if (categoryName === 'futsal') {
    productsToShow = mockFutsalBoots; // (ข้อมูลฟุตซอล)
    pageTitle = "รองเท้าฟุตซอล";
  } else if (categoryName === 'running') {
    // productsToShow = mockRunningBoots; (ข้อมูลรองเท้าวิ่ง)
    pageTitle = "รองเท้าวิ่ง";
  }

  // --- 4. ส่วนที่แสดงผล (Render) ---
  return (
    // เรายังใช้ class "page-container" จาก CSS ที่เราสร้าง
    <div className="page-container">
      
      {/* นี่คือส่วนหัวข้อที่คุณมีอยู่แล้ว (จากภาพ image_6eb13a.jpg) 
        อาจจะเป็น Banner หรือแค่ h1 ก็ได้ 
      */}
      <h1>
        หน้าแสดงรายการ: {pageTitle}
      </h1>
      <p>คุณกำลังดูหมวดหมู่: {categoryName}</p>

      {/* --- 5. เพิ่มตารางแสดงสินค้า (Product Grid) ---
        เราจะ map ข้อมูล productsToShow มาแสดงผลทีละชิ้น
      */}
      <div className="product-grid">
        {productsToShow.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* ถ้าไม่มีสินค้าในหมวดหมู่นั้นๆ */}
      {productsToShow.length === 0 && (
        <p style={{textAlign: 'center', marginTop: '2rem'}}>
          ขออภัย ยังไม่มีสินค้าในหมวดหมู่นี้
        </p>
      )}

    </div>
  );
};

export default CategoryPage;