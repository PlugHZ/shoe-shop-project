const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Use Routes
app.use('/api/products', productRoutes); // บอกให้ /api/products ไปใช้ไฟล์ productRoutes.js
app.use('/api/users', userRoutes); // บอกให้ /api/users ไปใช้ไฟล์ userRoutes.js  
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Start Server 

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});