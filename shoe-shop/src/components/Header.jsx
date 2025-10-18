import React from 'react';
import { FiSearch, FiUser, FiShoppingCart } from 'react-icons/fi';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container container">
        <h1 className="logo">CPE SHOP</h1>
        <nav className="main-nav">
          <ul>
            <li><a href="#">รองเท้าฟุตบอล</a></li>
            <li><a href="#">รองเท้าฟุตซอล</a></li>
            <li><a href="#">รองเท้าวิ่ง</a></li>
          </ul>
        </nav>
        <div className="header-icons">
          <FiSearch size={22} />
          <FiUser size={22} />
          <FiShoppingCart size={22} />
        </div>
      </div>
    </header>
  );
};
export default Header;