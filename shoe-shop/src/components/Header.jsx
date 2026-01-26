import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiShoppingCart, FiX } from "react-icons/fi";
import "./Header.css";
import ProfileDropdown from "./ProfileDropdown";
import { useCart } from "../context/CartContext";

const Header = () => {
  const { cartItems } = useCart();
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
    }
  };
  return (
    <header className="header">
      <div className="header-container container">
        <Link to="/" className="logo">
          CPE SHOP
        </Link>

        <nav className="main-nav">
          <ul>
            <li>
              <Link to="/category/football">รองเท้าฟุตบอล</Link>
            </li>
            <li>
              <Link to="/category/futsal">รองเท้าฟุตซอล</Link>
            </li>
            <li>
              <Link to="/category/running">รองเท้าวิ่ง</Link>
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
          <ProfileDropdown />
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
