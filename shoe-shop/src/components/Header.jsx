import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiShoppingCart,
  FiX,
  FiPackage,
  FiMenu,
  FiSettings,
} from "react-icons/fi";
import "./Header.css";
import ProfileDropdown from "./ProfileDropdown";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { cartItems } = useCart();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/?search=${encodeURIComponent(keyword.trim())}`);
      setIsSearchOpen(false);
      setKeyword("");
      setIsMenuOpen(false);
    }
  };
  const closeMenu = () => setIsMenuOpen(false);
  return (
    <header className="header">
      <div className="header-container container">
        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <Link to="/" className="logo" onClick={closeMenu}>
          CPE SHOP
        </Link>

        <nav className={`main-nav ${isMenuOpen ? "active" : ""}`}>
          <ul>
            <li>
              <Link to="/?category=รองเท้าฟุตบอล" onClick={closeMenu}>
                รองเท้าฟุตบอล
              </Link>
            </li>
            <li>
              <Link to="/?category=รองเท้าฟุตซอล" onClick={closeMenu}>
                รองเท้าฟุตซอล
              </Link>
            </li>
            <li>
              <Link to="/?category=รองเท้าวิ่ง" onClick={closeMenu}>
                รองเท้าวิ่ง
              </Link>
            </li>
          </ul>
        </nav>
        <div className="header-icons">
          <div className={`search-wrapper ${isSearchOpen ? "active" : ""}`}>
            {isSearchOpen && (
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="ค้นหาสินค้า..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  autoFocus
                />
              </form>
            )}
            <button
              className="icon-btn search-toggle"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title="ค้นหา"
            >
              {isSearchOpen ? <FiX size={22} /> : <FiSearch size={22} />}
            </button>
          </div>
          {user && user.role === "admin" && (
            <Link
              to="/admin"
              className="icon-btn admin-icon"
              title="ระบบหลังบ้าน"
            >
              <FiSettings size={22} />
            </Link>
          )}
          <ProfileDropdown />
          {user && ( // แสดงเฉพาะตอนล็อกอิน
            <Link to="/orders" className="icon-btn" title="ประวัติการสั่งซื้อ">
              <FiPackage size={22} />
            </Link>
          )}
          <Link to="/cart" className="cart-icon-wrapper">
            <FiShoppingCart size={22} />
            {totalQuantity > 0 && (
              <span className="cart-badge">{totalQuantity}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
