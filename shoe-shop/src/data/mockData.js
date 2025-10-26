// src/data/mockData.js
export const products = [
  {
    id: 1, // ใช้ id เป็น number หรือ string ก็ได้ แต่ควรให้ตรงกันทั้งหมด
    brand: 'Breaker',
    name: 'BREAKER COBRA 13 - ORANGE/LEMON',
    price: 2350, // เก็บราคาเป็นตัวเลข (Number)
    status: 'สินค้าพร้อมส่ง',
    sku: 'COBRA13OR',
    description: 'รองเท้าฟุตซอลคุณภาพสูงจาก Breaker...',
    // 👇 เปลี่ยน imageUrl เป็น images (array) 👇
    images: [
      '/images/products/shoe1.jpg',
      '/images/products/shoe1-thumb2.jpg', // เพิ่มรูปย่ออื่นๆ ถ้ามี
      '/images/products/shoe1-thumb3.jpg',
    ],
    sizes: ['38 EU', '39 EU', '40 EU', '41 EU', '42 EU'] // เพิ่ม array ของ sizes
  },
  {
    id: 2,
    brand: 'Nike',
    name: 'NIKE PHANTOM II HIGH ELITE TG',
    price: 11100,
    status: 'สินค้าพร้อมส่ง',
    sku: 'PHANTOM2HG',
    description: '...',
    images: [
      '/images/products/shoe2.jpg'
    ],
    sizes: ['40 EU', '41 EU', '42 EU', '43 EU']
  },
  {
    id: 3,
    brand: 'Skechers',
    name: 'SKECHERS SKX 2.0 ELITE TG - OBSIDIAN',
    price: 8400,
    status: 'สินค้าพร้อมส่ง',
    sku: 'SKX2OBS',
    description: '...',
    images: [
      '/images/products/shoe3.jpg'
    ],
    sizes: ['39 EU', '40 EU', '41 EU', '42 EU', '43 EU', '44 EU']
  },
   {
    id: 4,
    brand: 'Adidas',
    name: 'ADIDAS SAMBA MAN LTD - CORE',
    price: 3600,
     status: 'สินค้าพร้อมส่ง',
     sku: 'SAMBALTD',
     description: '...',
    images: [
      '/images/products/shoe4.jpg'
    ],
    sizes: ['40 EU', '41 EU', '42 EU', '43 EU', '44 EU']
  },
  {
    id: 5,
    brand: 'Mizuno',
    name: 'MIZUNO MORELIA NEO IV BETA JAPAN',
    price: 9900,
    status: 'สินค้าพร้อมส่ง',
    sku: 'MORELIABETA',
    description: '...',
    images: [
      '/images/products/shoe5.jpg'
    ],
    sizes: ['40 EU', '41 EU', '42 EU']
  },
  {
    id: 6,
    brand: 'Nike',
    name: 'NIKE STREETGATO - SMOKEY BLUE/',
    price: 1650,
    status: 'สินค้าพร้อมส่ง',
    sku: 'STREETGATOSB',
    description: '...',
    images: [
      '/images/products/shoe6.jpg'
    ],
    sizes: ['38 EU', '39 EU', '40 EU', '41 EU'],
    sale: '50%' // ป้าย Sale ยังคงเป็น string ได้
  },
];