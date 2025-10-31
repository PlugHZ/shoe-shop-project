// src/pages/CategoryPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard.jsx';
import './CategoryPage.css';

// --- 2. สร้างข้อมูลจำลอง (Mock Data) ---

// === ข้อมูลรองเท้าฟุตบอล (Football) ===
const mockFootballBoots = [];
const baseFootballProducts = [
  { name: 'Nike Mercurial Superfly 9', price: '9,500 THB', brand: 'NIKE' },
  { name: 'Adidas Predator Accuracy.1', price: '8,500 THB', brand: 'ADIDAS' },
  { name: 'Puma Future Ultimate', price: '7,900 THB', brand: 'PUMA' },
  { name: 'Mizuno Morelia Neo IV', price: '7,200 THB', brand: 'MIZUNO' }
];

// วนลูป 6 รอบ เพื่อสร้าง 6 แถว (6 * 4 = 24)
for (let i = 0; i < 6; i++) {
  baseFootballProducts.forEach((base, index) => {
    const id = (i * 4) + index + 1; // ID เริ่มที่ 1
    mockFootballBoots.push({
      id: id,
      brand: base.brand,
      name: `${base.name} #${id}`,
      price: base.price
    });
  });
}
// mockFootballBoots มี 24 รายการ

// === (ใหม่) ข้อมูลรองเท้าฟุตซอล (Futsal) ===
const mockFutsalBoots = [];
const baseFutsalProducts = [
  { name: 'Breaker Cobra 13', price: '2,350 THB', brand: 'BREAKER' },
  { name: 'Nike React Gato', price: '4,700 THB', brand: 'NIKE' },
  { name: 'Joma Top Flex Rebound', price: '3,100 THB', brand: 'JOMA' },
  { name: 'Asics Deportivo 2', price: '2,500 THB', brand: 'ASICS' }
];

// วนลูป 6 รอบ (6 * 4 = 24)
for (let i = 0; i < 6; i++) {
  baseFutsalProducts.forEach((base, index) => {
    const id = (i * 4) + index + 101; // ID เริ่มที่ 101 (ไม่ให้ซ้ำกับฟุตบอล)
    mockFutsalBoots.push({
      id: id,
      brand: base.brand,
      name: `${base.name} #${id}`,
      price: base.price
    });
  });
}
// mockFutsalBoots มี 24 รายการ

// === (ใหม่) ข้อมูลรองเท้าวิ่ง (Running) ===
const mockRunningBoots = [];
const baseRunningProducts = [
  { name: 'Nike Vaporfly 3', price: '7,800 THB', brand: 'NIKE' },
  { name: 'Adidas Adizero Adios Pro 3', price: '8,500 THB', brand: 'ADIDAS' },
  { name: 'Hoka Carbon X 3', price: '6,990 THB', brand: 'HOKA' },
  { name: 'Saucony Endorphin Pro 3', price: '7,990 THB', brand: 'SAUCONY' }
];

// วนลูป 6 รอบ (6 * 4 = 24)
for (let i = 0; i < 6; i++) {
  baseRunningProducts.forEach((base, index) => {
    const id = (i * 4) + index + 201; // ID เริ่มที่ 201 (ไม่ให้ซ้ำ)
    mockRunningBoots.push({
      id: id,
      brand: base.brand,
      name: `${base.name} #${id}`,
      price: base.price
    });
  });
}
// mockRunningBoots มี 24 รายการ


// --- เริ่ม Component ---
const CategoryPage = () => {
  const { categoryName } = useParams();

  // --- 3. เลือกข้อมูลที่จะแสดงตาม URL ---
  let productsToShow = [];
  let pageTitle = "ไม่พบหมวดหมู่";

  if (categoryName === 'football') {
    productsToShow = mockFootballBoots;
    pageTitle = "รองเท้าฟุตบอล";
  } else if (categoryName === 'futsal') {
    productsToShow = mockFutsalBoots; // (ใช้ข้อมูลใหม่)
    pageTitle = "รองเท้าฟุตซอล";
  } else if (categoryName === 'running') {
    productsToShow = mockRunningBoots; // (ใช้ข้อมูลใหม่)
    pageTitle = "รองเท้าวิ่ง";
  }

  // --- 4. ส่วนที่แสดงผล (Render) ---
  return (
    <div className="page-container">
      
      {/* คุณสามารถปรับแต่งส่วนหัวข้อนี้ได้ตามต้องการ 
        อาจจะเปลี่ยนเป็น Banner สวยๆ เหมือนในภาพตัวอย่าง
      */}
      <div style={{ padding: '2rem', backgroundColor: '#0a2a52', color: 'white', borderRadius: '8px', marginBottom: '2rem' }}>
        <h1>หน้าแสดงรายการ: {pageTitle}</h1>
        <p>คุณกำลังดูหมวดหมู่: {categoryName}</p>
      </div>


      {/* --- 5. ตารางแสดงสินค้า (Product Grid) --- */}
      <div className="product-grid">
        {productsToShow.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* ถ้าไม่มีสินค้า */}
      {productsToShow.length === 0 && (
        <p style={{textAlign: 'center', marginTop: '2rem'}}>
          ขออภัย ยังไม่มีสินค้าในหมวดหมู่นี้
        </p>
      )}

    </div>
  );
};

export default CategoryPage;