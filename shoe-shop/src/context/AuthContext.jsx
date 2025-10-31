import React, { useContext, useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword,createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; 

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  
  function logout() {
    return signOut(auth);
  }

  // useEffect จะคอยการเปลี่ยนแปลงสถานะการล็อกอินจาก Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // ถ้ามี user ล็อกอินจะดึงข้อมูล role จาก Backend ของเรา
        try {
          const response = await fetch(`http://localhost:3001/api/users/${user.uid}`);
          const userData = await response.json();
          // นำข้อมูลจาก Firebase และ MySQL มารวมกัน
          setUser({
            uid: user.uid,
            email: user.email,
            role: userData.role, 
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