import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Banner from "../components/Banner";
import Badges from "../components/Badges";
import ProductSection from "../components/ProductSection";
import ProductCard from "../components/ProductCard";
import "./Home.css";

const Home = () => {
  const { user } = useAuth();
  const { search } = useLocation();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const queryParams = new URLSearchParams(search);
  const searchTerm = queryParams.get("search");
  const categoryTerm = queryParams.get("category");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products${search}`,
        );
        const data = await response.json();
        setAllProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search]);

  const newArrivals = [...allProducts]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  const bestSellers = [...allProducts]
    .sort(() => 0.5 - Math.random())
    .slice(0, 8);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h2>กำลังโหลดข้อมูลสินค้า...</h2>
      </div>
    );
  }

  return (
    <div className="home-page">
      {!search && (
        <>
          <Banner />

          <div className="container badges-wrapper">
            <Badges />
          </div>
        </>
      )}

      {user && user.role === "admin" && (
        <div className="container admin-controls-wrapper">
          <Link to="/admin/add-product" className="add-product-btn">
            + เพิ่มสินค้าใหม่
          </Link>
        </div>
      )}

      {/* ส่วนแสดงผล: ผลการค้นหา GRID VIEW*/}
      {search ? (
        <div className="container search-results-section">
          <h2 className="section-title">
            {searchTerm
              ? `ผลการค้นหาสำหรับ "${searchTerm}"`
              : `หมวดหมู่: ${categoryTerm}`}
          </h2>

          {allProducts.length > 0 ? (
            <div className="product-grid-view">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <h2>ไม่พบสินค้า</h2>
              <p>ลองค้นหาด้วยคำอื่น หรือเลือกดูหมวดหมู่ด้านบนอีกครั้งครับ</p>
              <Link to="/" className="btn-back-home">
                กลับหน้าหลัก
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* ส่วนแสดงผล: หน้าแรกปกติ SWIPER VIEW */
        <>
          <ProductSection title="สินค้ามาใหม่" products={newArrivals} />
          <ProductSection title="สินค้ายอดฮิต" products={bestSellers} />
        </>
      )}
    </div>
  );
};

export default Home;
