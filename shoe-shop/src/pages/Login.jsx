import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import hook ของเรา

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); // ดึงฟังก์ชัน login มาจาก Context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/'); // กลับไปหน้าแรกหลังล็อกอินสำเร็จ
    } catch (err) {
      setError('Failed to log in. Please check your email and password.');
      console.error("Failed to log in:", err);
    }
  };

  return (
    <div>
      <h2>Log In</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Log In</button>
      </form>
    </div>
  );
};

export default Login;