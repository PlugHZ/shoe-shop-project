import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthForm.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match!");
    }

    try {
      const userCredential = await signup(email, password);
      const user = userCredential.user;

      //  ส่งข้อมูล User ไปบันทึกที่ Backend
      await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          firebase_uid: user.uid,
        }),
      });

      navigate("/");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email address is already in use.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Failed to create an account. Please try again.");
      }
      console.error("Failed to sign up:", err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-image-section signup-bg">
        <div className="auth-overlay">
          <h1>Join Us!</h1>
          <p>สมัครสมาชิกวันนี้เพื่อรับสิทธิพิเศษมากมาย</p>
        </div>
      </div>
      <div className="auth-form-section">
        <div className="auth-container">
          <h2>สมัครสมาชิก</h2>
          <p>สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน</p>

          <form onSubmit={handleSubmit}>
            {error && <p className="error-message">{error}</p>}

            <div className="form-group">
              <label htmlFor="email">อีเมล</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">รหัสผ่าน</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="สร้างรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">ยืนยันรหัสผ่าน</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="กรอกรหัสผ่านอีกครั้งเพื่อยืนยัน"
              />
            </div>

            <button type="submit" className="auth-button">
              สมัครสมาชิก
            </button>
          </form>

          <div className="bottom-link">
            มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
          </div>
          <div className="back-home">
            <Link to="/">← กลับหน้าหลัก</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
