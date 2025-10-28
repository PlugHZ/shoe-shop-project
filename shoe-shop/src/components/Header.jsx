import React from 'react';
// 1. Import 'Link' จาก react-router-dom
import { Link } from 'react-router-dom'; 
import { FiSearch, FiShoppingCart } from 'react-icons/fi';
import './Header.css';
import ProfileDropdown from './ProfileDropdown';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { cartItems } = useCart();
  const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  return (
    <header className="header">
      <div className="header-container container">
        <Link to="/" className="logo">CPE SHOP</Link>

        <nav className="main-nav">
          <ul>
            <li><a href="#">รองเท้าฟุตบอล</a></li>
            <li><a href="#">รองเท้าฟุตซอล</a></li>
            <li><a href="#">รองเท้าวิ่ง</a></li>
          </ul>
        </nav>
        <div className="header-icons">
          <FiSearch size={22} />
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