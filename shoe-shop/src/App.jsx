import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Import AuthProvider เข้ามา
import { AuthProvider } from './context/AuthContext'; 

import Header from './components/Header';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      {/* 2. นำ AuthProvider มาครอบทุก Component ที่อยู่ข้างใน */}
      <AuthProvider>

        <Header />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>

        <Footer />

      </AuthProvider>
    </Router>
  );
}

export default App;