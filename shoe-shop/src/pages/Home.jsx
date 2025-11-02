import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Banner from '../components/Banner';
import Badges from '../components/Badges';
import ProductSection from '../components/ProductSection';

const Home = () => {
  const { user } = useAuth();

  
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true); 

  //  ใช้ useEffect เพื่อดึงข้อมูลจาก Backend เมื่อหน้าเว็บโหลด
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        const data = await response.json();

        setAllProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchProducts();
  }, []); 
  // สินค้ามาใหม่: เรียงลำดับตาม 'created_at' (วันที่สร้าง) จากใหม่ไปเก่า
  const newArrivals = [...allProducts]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);
  const bestSellers = [...allProducts]
    .sort(() => 0.5 - Math.random())
    .slice(0, 8);

  if (loading) {
    return <div className="container" style={{padding: '3rem 0', textAlign: 'center'}}><h2>กำลังโหลดข้อมูลสินค้า...</h2></div>;
  }

  return (
    <>
      <Banner />
      <Badges />

      {user && user.role === 'admin' && (
        <div className="admin-controls container">
          <Link to="/admin/add-product" className="add-product-btn">
            + เพิ่มสินค้าใหม่
          </Link>
        </div>
      )}

      <ProductSection title="สินค้ามาใหม่" products={newArrivals} />
      <ProductSection title="สินค้ายอดฮิต" products={bestSellers} />
    </>
  );
};

export default Home;