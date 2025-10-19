import React, { useContext, useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; 

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันสำหรับ Login
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // ฟังก์ชันสำหรับ Logout
  function logout() {
    return signOut(auth);
  }

  // useEffect จะคอย "ฟัง" การเปลี่ยนแปลงสถานะการล็อกอินจาก Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // ถ้ามี user ล็อกอิน, ให้ไปดึงข้อมูล role จาก Backend ของเรา
        try {
          const response = await fetch(`http://localhost:3001/api/users/${user.uid}`);
          const userData = await response.json();
          // นำข้อมูลจาก Firebase และ MySQL มารวมกัน
          setUser({
            uid: user.uid,
            email: user.email,
            role: userData.role, // <-- ข้อมูลสำคัญจาก MySQL
          });
        } catch (error) {
          console.error("Failed to fetch user role", error);
          setUser(user); // ถ้าหา role ไม่เจอ ก็เก็บแค่ข้อมูลจาก Firebase
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe; 
  }, []);

  const value = {
    user,
    login,
    logout
  };

  // !loading && children หมายถึงให้รอจนกว่าจะเช็ค user เสร็จแล้วค่อยแสดงผลแอป
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};