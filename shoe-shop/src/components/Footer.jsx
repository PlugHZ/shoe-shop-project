import React from 'react';
import { FaPhoneAlt, FaFacebookF, FaInstagram, FaLine, FaYoutube, FaCcVisa, FaCcMastercard, FaCcJcb } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container container">
        {/* Column 1: Contact Info */}
        <div className="footer-column contact-info">
          <img src="/images/logo.png" alt="CPE SHOP Logo" className="footer-logo" />
          <div className="contact-item">
            <FaPhoneAlt />
            <div>
              <p>088-888-8888</p>
              <span>Mon - Sun: 10.30 AM - 18.00 PM</span>
            </div>
          </div>
          <div className="contact-item">
            <MdEmail />
            <a href="mailto:help@sidthiphak.j@ku.th">help@sidthiphak.j@ku.th</a>
          </div>
        </div>

        {/* Column 2: About Us */}
        <div className="footer-column">
          <h3>เกี่ยวกับเรา</h3>
          <ul>
            <li><a href="#">เกี่ยวกับ CPE SHOP</a></li>
            <li><a href="#">ที่ตั้งสาขา</a></li>
            <li><a href="#">ติดต่อเรา</a></li>
            <li><a href="#">ร่วมงานกับเรา</a></li>
          </ul>
        </div>

        {/* Column 3: Help & Info */}
        <div className="footer-column">
          <h3>ช่วยเหลือและข้อมูล</h3>
          <ul>
            <li><a href="#">นโยบายความเป็นส่วนตัว</a></li>
            <li><a href="#">เงื่อนไขและข้อตกลง</a></li>
            <li><a href="#">คำถามที่พบบ่อย</a></li>
            <li><a href="#">วิธีการสั่งซื้อสินค้า</a></li>
          </ul>
        </div>
        
        

        {/* Column 4: Payment & Social */}
        <div className="footer-column">
          <h3>ชำระบัตรเครดิต / ผ่อนชำระ</h3>
          <div className="payment-icons">
            <FaCcVisa size={30} />
            <FaCcMastercard size={30} />
            <FaCcJcb size={30} />
          </div>
          <h3 className="social-title">โซเชียลมีเดีย</h3>
          <div className="social-icons">
            <a href="#"><FaFacebookF size={24} /></a>
            <a href="#"><FaInstagram size={24} /></a>
            <a href="#"><FaLine size={24} /></a>
            <a href="#"><FaYoutube size={24} /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 CPE SHOP. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;