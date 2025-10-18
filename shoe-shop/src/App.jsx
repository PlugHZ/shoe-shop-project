import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';    
import Signup from './pages/Signup';   


import Login from './pages/Login';

function App() {
  return (
   
    <Router>
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      
      {/* <Footer /> You can add a footer component here */}
    </Router>
  );
}

export default App;