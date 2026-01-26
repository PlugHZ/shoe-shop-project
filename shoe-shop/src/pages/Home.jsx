import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Banner from "../components/Banner";
import Badges from "../components/Badges";
import ProductSection from "../components/ProductSection";

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
        // ส่ง query string (search) ไปที่ Backend เพื่อกรองข้อมูล
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
  }, [search]); // โหลดข้อมูลใหม่ทุกครั้งที่ URL เปลี่ยนแปลง

  const newArrivals = [...allProducts]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  const bestSellers = [...allProducts]
    .sort(() => 0.5 - Math.random())
    .slice(0, 8);

  if (loading) {
    return (
      <div
        className="container"
        style={{ padding: "3rem 0", textAlign: "center" }}
      >
        <h2>กำลังโหลดข้อมูลสินค้า...</h2>
      </div>
    );
  }

  return (
    <>
      {/* ซ่อน Banner และ Badges เมื่อมีการค้นหาหรือกรองหมวดหมู่ */}
      {!search && (
        <>
          <Banner />
          <Badges />
        </>
      )}

      {user && user.role === "admin" && (
        <div
          className="admin-controls container"
          style={{ marginTop: search ? "2rem" : "0" }}
        >
          <Link to="/admin/add-product" className="add-product-btn">
            + เพิ่มสินค้าใหม่
          </Link>
        </div>
      )}

      {/* --- ส่วนแสดงผลเมื่อมีการ Filter (Search หรือ Category) --- */}
      {search ? (
        <div className="search-results-container">
          {allProducts.length > 0 ? (
            <ProductSection
              // ปรับหัวข้อตามสิ่งที่ผู้ใช้เลือกค้นหา
              title={
                searchTerm
                  ? `ผลการค้นหาสำหรับ "${searchTerm}"`
                  : `หมวดหมู่: ${categoryTerm}`
              }
              products={allProducts}
            />
          ) : (
            <div
              className="container"
              style={{ padding: "5rem 0", textAlign: "center" }}
            >
              <h2>ไม่พบสินค้าในหมวดหมู่ "{categoryTerm || searchTerm}"</h2>
              <p>ลองค้นหาด้วยคำอื่น หรือเลือกดูหมวดหมู่ด้านบนอีกครั้งครับ</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <ProductSection title="สินค้ามาใหม่" products={newArrivals} />
          <ProductSection title="สินค้ายอดฮิต" products={bestSellers} />
        </>
      )}
    </>
  );
};

export default Home;
