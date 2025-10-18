import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; 
import './AuthForm.css'; // Import ไฟล์ CSS กลาง

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // State สำหรับยืนยันรหัสผ่าน
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
    if (password !== confirmPassword) {
      return setError('Passwords do not match!');
    }
    
    try {
      // 1. สร้าง User ใน Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. ส่งข้อมูล User ไปบันทึกที่ Backend
      await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          firebase_uid: user.uid,
        }),
      });

      // 3. ไปที่หน้าแรกหลังจากสมัครสำเร็จ
      navigate('/');

    } catch (err) {
      // แปลง error message ของ Firebase ให้อ่านง่ายขึ้น
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
      console.error("Failed to sign up:", err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-image-section signup-bg">
        {/* รูปพื้นหลังถูกกำหนดด้วย class 'signup-bg' จาก CSS */}
      </div>
      <div className="auth-form-section">
        <div className="auth-container">
          <h2>Create Your Account</h2>
          <p>Join our awesome shoe store!</p>
          
          <form onSubmit={handleSubmit}>
            {error && <p className="error-message">{error}</p>}
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                id="email" type="email" value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                id="password" type="password" value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required placeholder="Create a password (min. 6 characters)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input 
                id="confirm-password" type="password" value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required placeholder="Confirm your password"
              />
            </div>
            
            <button type="submit" className="auth-button">Create Account</button>
          </form>

          <div className="bottom-link">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;