// src/pages/CategoryPage.jsx
import React, { useState, useEffect } from 'react'; 
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard.jsx'; //
import './CategoryPage.css'; //

// ฟังก์ชัน สำหรับแปลง URL slug เป็นชื่อ Category ที่อยู่ใน DB
const formatCategoryName = (name) => {
    switch (name.toLowerCase()) {
        case 'football':
            return 'รองเท้าฟุตบอล';
        case 'futsal':
            return 'รองเท้าฟุตซอล';
        case 'running':
            return 'รองเท้าวิ่ง';
        
        default:
            return name; 
    }
};


const CategoryPage = () => {
    const { categoryName } = useParams();
    
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // แปลงชื่อ Category ใน URL ให้ตรงกับค่าใน DB
    const targetCategory = formatCategoryName(categoryName);
    
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                // (สำคัญ!) ตรวจสอบว่ามี ' ' ครอบ URL นี้
                const response = await fetch('http://localhost:3001/api/products');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch products from server');
                }
                
                const data = await response.json();
                setAllProducts(data);
                
            } catch (err) {
                console.error("Error fetching products:", err);
                setError('ไม่สามารถโหลดรายการสินค้าได้');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);
    
    //กรองสินค้าตาม Category ที่ต้องการแสดงผล
    const filteredProducts = allProducts.filter(product => {
        return product.category === targetCategory;
    });
    
    const pageTitle = targetCategory;

    if (loading) return <h2 className="container" style={{padding: '3rem 0'}}>กำลังโหลดสินค้า...</h2>;
    if (error) return <h2 className="container" style={{padding: '3rem 0', color: 'red'}}>{error}</h2>;

    return (
        <div className="category-page-container container">
            <div style={{ padding: '2rem', backgroundColor: '#0a2a52', color: 'white', borderRadius: '8px', marginBottom: '2rem' }}>
                <h1>หน้าแสดงรายการ: {pageTitle}</h1>
                <p>{filteredProducts.length} รายการในหมวดหมู่</p>
            </div>

            {filteredProducts.length === 0 ? (
                <p style={{textAlign: 'center', marginTop: '2rem'}}>
                    ขออภัย ยังไม่พบสินค้าในหมวดหมู่ "{pageTitle}" นี้
                </p>
            ) : (
                <div className="product-grid">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} /> //
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryPage;