import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity, size) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id && item.size === size);
      if (existingItem) {
        // ถ้ามีสินค้า+ไซส์เดิมอยู่แล้ว ให้อัปเดตจำนวน
        return prevItems.map(item =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      // ถ้ายังไม่มี ให้เพิ่มเข้าไปใหม่
      return [...prevItems, { ...product, quantity, size }];
    });
    console.log('Cart Items:', cartItems); // สำหรับดูข้อมูลใน Console
  };

  const removeFromCart = (id, size) => {
    setCartItems(prevItems => prevItems.filter(item => !(item.id === id && item.size === size)));
  };

  const updateQuantity = (id, size, newQuantity) => {
    // ตรวจสอบให้แน่ใจว่าจำนวนไม่ต่ำกว่า 1
    const quantity = Math.max(1, parseInt(newQuantity) || 1); 
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id && item.size === size
          ? { ...item, quantity: quantity }
          : item
      )
    );
  };

  // คำนวณยอดรวม
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const value = { cartItems, addToCart, removeFromCart, updateQuantity, cartTotal };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};