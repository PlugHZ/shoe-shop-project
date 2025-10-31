// src/pages/CategoryPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

const CategoryPage = () => {
  // ดึงชื่อ category จาก URL (เช่น 'football', 'futsal')
  const { categoryName } = useParams();

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      {/* เราสามารถใช้ categoryName เพื่อเปลี่ยนหัวข้อ
        และใช้มันเพื่อดึงข้อมูลสินค้าที่ตรงกับหมวดหมู่นี้ต่อไป 
      */}
      <h1>
        หน้าแสดงรายการ: {
          categoryName === 'football' ? 'รองเท้าฟุตบอล' :
          categoryName === 'futsal' ? 'รองเท้าฟุตซอล' :
          categoryName === 'running' ? 'รองเท้าวิ่ง' :
          'สินค้าทั้งหมด'
        }
      </h1>
      
      <p>คุณกำลังดูหมวดหมู่: {categoryName}</p>

      {/* TODO: ในอนาคต คุณสามารถเพิ่มโค้ดสำหรับดึงข้อมูล
        และแสดงรายการสินค้า (ProductList) ที่นี่ได้ครับ
      */}
    </div>
  );
};

export default CategoryPage;