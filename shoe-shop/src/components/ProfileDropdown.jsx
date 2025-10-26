import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext'; 
import './ProfileDropdown.css';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen(!isOpen);

  // ฟังก์ชันนี้จะช่วยปิดเมนูเมื่อคลิกที่อื่น
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      {/* ไอคอน FiUser ที่ใช้เป็นปุ่มเปิด/ปิดเมนู */}
      <button onClick={toggleDropdown} className="icon-button">
        <FiUser size={22} />
      </button>

      {/* ส่วนของเมนูที่จะแสดงเมื่อ isOpen เป็น true */}
      {isOpen && (
        <div className="dropdown-menu">
          {user ? (
            // --- แสดงส่วนนี้เมื่อ User ล็อกอินแล้ว ---
            <>
              <div className="user-info">
                Signed in as <br />
                <strong>{user.email}</strong>
              </div>
              <button onClick={handleLogout} className="dropdown-item logout">
                Log Out
              </button>
            </>
          ) : (
            // --- แสดงส่วนนี้เมื่อยังไม่ได้ล็อกอิน ---
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="dropdown-item">
                เข้าสู่ระบบ
              </Link>
              <p className="separator">
                หรือสมัครสมาชิกเพื่อรับ
                <br />
                ส่วนลดและสิทธิพิเศษจากเรา
              </p>
              <Link to="/signup" onClick={() => setIsOpen(false)} className="dropdown-item alt">
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;