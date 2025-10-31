import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Header from './components/Header'; // <-- ไม่ต้องแก้ .jsx ถ้ามันเป็นโฟลเดอร์ index.js
import Home from './pages/Home.jsx'; // <-- แก้เป็น .jsx ตามที่เราคุยกัน
import Signup from './pages/Signup.jsx'; // <-- แก้เป็น .jsx
import Login from './pages/Login.jsx'; // <-- แก้เป็น .jsx
import Footer from './components/Footer'; // <-- ไม่ต้องแก้ .jsx ถ้ามันเป็นโฟลเดอร์ index.js
import ProductDetail from './pages/ProductDetail.jsx'; // <-- แก้เป็น .jsx
import Cart from './pages/Cart.jsx'; // <-- แก้เป็น .jsx
import Checkout from './pages/Checkout.jsx';

// --- 1. เพิ่ม import ของหน้า CategoryPage ---
import CategoryPage from './pages/CategoryPage.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-wrapper">
          <Header />

          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />

              {/* --- 2. เพิ่ม Route ใหม่สำหรับ CategoryPage --- */}
              <Route path="/category/:categoryName" element={<CategoryPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;