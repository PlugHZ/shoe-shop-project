import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthForm.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      console.error("Failed to log in:", err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-image-section login-bg">
        <div className="auth-overlay">
          <h1>Welcome Back!</h1>
          <p>เข้าสู่ระบบเพื่อเลือกซื้อรองเท้าคู่โปรดของคุณ</p>
        </div>
      </div>
      <div className="auth-form-section">
        <div className="auth-container">
          <h2>เข้าสู่ระบบ</h2>
          <p>ยินดีต้อนรับกลับสู่ CPE Shop</p>

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
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="auth-button">
              เข้าสู่ระบบ
            </button>
          </form>

          <div className="bottom-link">
            ยังไม่มีบัญชีใช่ไหม? <Link to="/signup">สมัครสมาชิก</Link>
          </div>
          <div className="back-home">
            <Link to="/">← กลับหน้าหลัก</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
