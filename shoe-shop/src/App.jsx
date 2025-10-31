import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Footer from './components/Footer';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductForm from './pages/ProductForm';

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
              <Route path="/admin/add-product" element={<ProductForm />} />
            </Routes>

          </main>

          <Footer />

        </div>

      </AuthProvider>
    </Router>
  );
}

export default App;