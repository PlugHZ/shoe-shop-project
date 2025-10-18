import React from 'react';
// 1. Import 'Link' จาก react-router-dom
import { Link } from 'react-router-dom'; 
import { FiSearch, FiShoppingCart } from 'react-icons/fi';
import './Header.css';
import ProfileDropdown from './ProfileDropdown';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container container">

        {/* 2. เปลี่ยน h1 เป็น <Link> และใส่ to="/" */}
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
          <FiShoppingCart size={22} />
        </div>
      </div>
    </header>
  );
};

export default Header;