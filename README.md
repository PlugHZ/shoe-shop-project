# Shoe Shop E-commerce Project
ระบบร้านค้าออนไลน์ขายรองเท้าที่มีระบบจัดการสต็อกสินค้า การชำระเงินผ่าน PromptPay QR Code การจัดการDashboard  และการจัดเก็บข้อมูลบน Cloud

## Features
- ระบบตะกร้าสินค้าที่จัดการผ่าน React Context API
- ระบบตัดสต็อกสินค้าอัตโนมัติเมื่อมีการสั่งซื้อ และระบบ Database Transaction ป้องกันสินค้าติดลบหรือขายเกินจำนวนจริง
- PromptPay QR Generation: สร้าง QR Code สำหรับชำระเงินอัตโนมัติจากยอดรวมในตะกร้าโดยใช้ promptpay-qr และแสดงผลผ่าน react-qr-code
- ระบบอัปโหลดรูปภาพสินค้าและสลิปการโอนเงินไปจัดเก็บที่ AWS S3
- ระบบ Admin Dashboard สำหรับจัดการสินค้า (เพิ่ม/ลบ/แก้ไข) และตรวจสอบสถานะออเดอร์พร้อมดูหลักฐานการโอนเงินและปรับสถานะสินค้า

## Tech Stack
- Frontend
  - Framework: React (Vite)
  - State Management: Context API (Cart & Auth)
  - Styling: CSS3 (Responsive Design)
  - Authentication: Firebase Auth
  
- Backend
  - Runtime: Node.js & Express.js
  - Database: MySQL
  - Storage: AWS S3

## Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/PlugHZ/shoe-shop-project.git
   cd shoe-shop-project
   ```
2. Install dependencies
   Frontend:
    ```bash
   cd ../shoe-shop
   npm install
   ```
    Backend:
    ```bash
   cd ../shoe-shop-backend
   npm install
   ```
3. Environment Variables Setup
   สร้างไฟล์ .env ในโฟลเดอร์ของแต่ละส่วนเพื่อเชื่อมต่อระบบต่างๆ:
   * Frontend (shoe-shop/.env):
      ```bash
      VITE_API_URL=http://localhost:3001
      VITE_PROMPTPAY_NUMBER=your phone number for promptpay
      # Firebase Configuration
      VITE_FIREBASE_API_KEY=your_api_key
      VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
      VITE_FIREBASE_PROJECT_ID=your_project_id
      VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
      VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
      VITE_FIREBASE_MEASUREMENT_ID=your_MEASUREMENT_ID
      VITE_FIREBASE_APP_ID=your_app_id
      ```
   *  Backend (shoe-shop-backend/.env):
       ```bash
      PORT=3001
      DB_HOST=your_host
      DB_USER=your_user
      DB_PASSWORD=your_password
      DB_NAME=your_db
      DB_PORT=3306
      
      # AWS S3 Configuration
      AWS_ACCESS_KEY_ID=your_aws_access_key
      AWS_SECRET_ACCESS_KEY=your_aws_secret_key
      AWS_S3_REGION=your_region
      AWS_SLIP_BUCKET_NAME=your_bucket_name

       ```
 4. Start the development server
    รันทั้งสองส่วนพร้อมกัน
    Frontend:
    ```bash
    # อยู่ในโฟลเดอร์ shoe-shop
    npm run dev
    ```
    
    Backend:
    ```bash
    # อยู่ในโฟลเดอร์ shoe-shop-backend
    npm start
    ```

 5. Database setting
    สามารถ download จากใน repository และนำไป import เข้า mysql ได้เลย

## Folder Structure

 - Frontend (React & Vite)
   ```bash
    shoe-shop/
    ├── public/                # ไฟล์ Static สำหรับใช้งานสาธารณะ
    ├── src/
    │   ├── assets/       
    │   ├── components/        # UI Components แยกตามฟังก์ชันการใช้งาน
    │   │   ├── Badges.css / Badges.jsx
    │   │   ├── Banner.css / Banner.jsx
    │   │   ├── Footer.css / Footer.jsx
    │   │   ├── Header.css / Header.jsx
    │   │   ├── ProductCard.css / ProductCard.jsx
    │   │   ├── ProductSection.css / ProductSection.jsx
    │   │   ├── ProfileDropdown.css / ProfileDropdown.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/           # ระบบจัดการ State (Cart & Auth)
    │   │   ├── AuthContext.jsx
    │   │   └── CartContext.jsx
    │   ├── pages/             # หน้าหลักต่างๆ ของแอปพลิเคชัน
    │   │   ├── admin/         # ส่วนจัดการสำหรับผู้ดูแลระบบ
    │   │   │   ├── AdminDashboard.css / AdminDashboard.jsx
    │   │   │   ├── AdminOrder.jsx
    │   │   │   ├── AdminOrders.css
    │   │   │   ├── AdminProductList.css / AdminProductList.jsx
    │   │   │   ├── EditProduct.jsx
    │   │   │   └── ProductForm.css / ProductForm.jsx
    │   │   ├── AuthForm.css
    │   │   ├── Cart.css / Cart.jsx
    │   │   ├── CategoryPage.css / CategoryPage.jsx
    │   │   ├── Checkout.css / Checkout.jsx
    │   │   ├── Home.css / Home.jsx
    │   │   ├── Login.css / Login.jsx
    │   │   ├── OrderHistory.css / OrderHistory.jsx
    │   │   ├── OrderSuccess.css / OrderSuccess.jsx
    │   │   ├── ProductDetail.css / ProductDetail.jsx
    │   │   └── Signup.jsx
    │   ├── App.css / App.jsx  # ไฟล์หลักสำหรับจัดการ Routes
    │   ├── firebase.js        # การตั้งค่า Firebase Authentication
    │   ├── index.css
    │   └── main.jsx          
    ├── .env                   # (API URL, Firebase Keys)
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json          
    ├── README.md
    └── vite.config.js         
    ```
 - Backend (Node.js & Express)
  ```bash
     shoe-shop-backend/
    ├── config/
    │   └── db.js              # การตั้งค่า MySQL Connection Pool
    ├── node_modules/          
    ├── routes/                # ส่วนจัดการ API Endpoints แยกตามหมวดหมู่
    │   ├── cartRoutes.js      # ระบบจัดการตะกร้าสินค้า
    │   ├── orderRoutes.js     # ระบบจัดการออเดอร์และการตัดสต็อก
    │   ├── productRoutes.js   # ระบบจัดการสินค้า
    │   └── userRoutes.js      # ระบบจัดการผู้ใช้
    ├── utils/               
    │   └── s3.js              # ระบบจัดการไฟล์บน AWS S3 Storage
    ├── .env                   # (DB Credentials, AWS Keys)
    ├── index.js               # ไฟล์หลักสำหรับรัน Server
    ├── package-lock.json
    ├── package.json           
    ├── .gitignore
    └── README.md              # รายละเอียดโปรเจกต์

  ```

    
     
   

  
