// s3.js

// 🔴 [แก้ไข] เพิ่ม DeleteObjectCommand เข้ามา
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid"); 
require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * อัปโหลดไฟล์ไปที่ AWS S3
 * @param {object} file - อ็อบเจกต์ไฟล์จาก Multer (req.file)
 * @returns {Promise<string>} - URL สาธารณะของไฟล์ที่อัปโหลดแล้ว
 */
async function uploadFileToS3(file) {
  // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
  const fileName = `products/${uuidv4()}-${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    
    // สร้างและคืนค่า URL สาธารณะ
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${fileName}`;
  
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}

/**
 * ลบไฟล์จาก AWS S3 โดยใช้ URL เต็ม
 * @param {string} imageUrl - URL เต็มของไฟล์ใน S3
 * @returns {Promise<void>}
 */
async function deleteFileFromS3(imageUrl) {
    try {
        // 1. ดึง Key (ชื่อไฟล์/Path ใน Bucket) จาก URL
        const urlParts = new URL(imageUrl);
        // Pathname จะได้ '/products/uuid-filename.jpg' เราต้องลบ '/' ตัวแรกออก
        const Key = urlParts.pathname.substring(1); 

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: Key
        };

        // 2. ส่งคำสั่งลบ
        // 💡 ตอนนี้ DeleteObjectCommand ถูกนิยามแล้ว และจะทำงานได้
        await s3Client.send(new DeleteObjectCommand(params));
        console.log(`Successfully deleted S3 file: ${Key}`);
        
    } catch (error) {
        // Log ข้อผิดพลาด แต่ไม่ throw เพื่อให้ Logic ลบ DB ทำงานต่อ
        console.error(`Error deleting file ${imageUrl} from S3 (might already be gone):`, error.message);
    }
}

module.exports = { uploadFileToS3, deleteFileFromS3 };