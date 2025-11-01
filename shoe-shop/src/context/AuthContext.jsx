import React, { useContext, useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword,createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // 👈

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // (ฟังก์ชัน signup, login, logout ของเพื่อนคุณ ดีอยู่แล้ว)
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }
  function logout() {
    return signOut(auth);
  }

  // useEffect จะคอย "ฟัง" การเปลี่ยนแปลงสถานะการล็อกอินจาก Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // ถ้ามี user ล็อกอินใน Firebase
        try {
          // 1. (แก้ไข!) ไปดึงข้อมูลจาก Backend ของเรา
          //    (เราใช้ firebaseUser.uid เพื่อไปค้นหาในตาราง users)
          const response = await fetch(`http://localhost:3001/api/users/${firebaseUser.uid}`);
          
          // --- (นี่คือส่วนที่แก้ไข) ---
          if (response.ok) { 
            // ถ้าหาเจอ (200 OK)
            const userData = await response.json(); // จะได้ { id, email, role }
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              id: userData.id,      // 👈 (สำคัญ!) ได้ id จาก MySQL
              role: userData.role,  // 👈 ได้ role จาก MySQL
            });
          } else {
            // ถ้าหาไม่เจอ (404 Not Found)
            // (เช่น User เพิ่งสมัคร หรือเป็น User เก่าที่ไม่มีใน DB)
            // ให้ล็อกอินต่อไป แต่จะมีแค่ข้อมูล Firebase
            console.warn("User found in Firebase, but not in MySQL DB.");
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              id: null,   // 👈 (สำคัญ!) id เป็น null
              role: null, // 👈 role เป็น null
            });
          }
          // --- (จบส่วนที่แก้ไข) ---

        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setUser(firebaseUser); // ถ้า API พัง ก็เก็บแค่ข้อมูล Firebase
        }
      } else {
        // ไม่ได้ล็อกอิน
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe; 
  }, []);

  const value = {
    user,
    signup,
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