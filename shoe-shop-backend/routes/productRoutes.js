const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadFileToS3, deleteFileFromS3 } = require("../utils/s3");
const db = require("../config/db");

const storage = multer.memoryStorage();
const upload = multer({ storage });

//Helper
function isJsonString(str) {
  if (typeof str !== "string") return false;
  try {
    const parsed = JSON.parse(str);
    return parsed && typeof parsed === "object";
  } catch (e) {
    return false;
  }
}

// GET: All Products
router.get("/", (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch products" });

    const products = results.map((p) => ({
      ...p,
      image_urls: isJsonString(p.image_urls)
        ? JSON.parse(p.image_urls)
        : p.image_urls
        ? [p.image_urls]
        : [],
    }));
    res.json(products);
  });
});

//GET: Product by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM products WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch product" });
    if (results.length === 0)
      return res.status(404).json({ error: "Product not found" });

    const product = results[0];
    //console.log("SIZE PARSING");
    //console.log(" Raw DB Sizes Value:", product.sizes); // ดูก่อนแปลง
    //console.log("Is it recognized as JSON?", isJsonString(product.sizes)); // ดูผลลัพธ์ isJsonString
    const formatted = {
      ...product,
      image_urls: isJsonString(product.image_urls)
        ? JSON.parse(product.image_urls)
        : product.image_urls
        ? [product.image_urls]
        : [],
      sizes: Array.isArray(product.sizes) //ตรวจว่าเป็น Array อยู่แล้วมั้ย
        ? product.sizes //ถ้าเป็น Array ที่พังแล้ว ก็ใช้ Array นี้เลย
        : isJsonString(product.sizes)
        ? JSON.parse(product.sizes) //ถ้าเป็น JSON String ก็แปลง
        : product.sizes
        ? [product.sizes] //ถ้าเป็น String ธรรมดาที่ไม่ใช่ JSON ก็ห่อเป็น Array
        : [],
    };
    res.json(formatted);
  });
});
//Delete Product
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  let imageUrls = [];
  let allUrlsToProcess = [];

  try {
    // ดึง URL รูปภาพก่อนลบข้อมูลสินค้า
    const selectSql = "SELECT image_urls FROM products WHERE id = ?";
    //  ใช้ db.promise().query หรือห่อ db.query ด้วย Promise
    const [productResults] = await db.promise().query(selectSql, [id]);

    if (productResults.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const rawImageUrls = productResults[0].image_urls;

    //แปลง URL ที่เป็น JSON/String ให้เป็น Array 1 มิติ
    if (isJsonString(rawImageUrls)) {
      imageUrls = JSON.parse(rawImageUrls);
    } else if (rawImageUrls) {
      imageUrls = [rawImageUrls];
    }

    // จัดการปัญหา URL ที่มี Comma คั่นจากข้อมูลเก่า (ป้องกันการลบไฟล์ S3 ล้มเหลว)
    allUrlsToProcess = imageUrls.flatMap((url) => {
      if (typeof url === "string" && url.includes(",")) {
        return url.split(",").map((s) => s.trim());
      }
      return url;
    });

    const validUrls = allUrlsToProcess.filter(
      (url) => url && typeof url === "string"
    );

    //ลบข้อมูลสินค้าในฐานข้อมูล
    const deleteDbSql = "DELETE FROM products WHERE id = ?";
    const [deleteDbResult] = await db.promise().query(deleteDbSql, [id]);

    if (deleteDbResult.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Product not found (or already deleted)" });
    }

    //  ลบไฟล์จาก S3 (ทำงานพร้อมกัน)
    if (validUrls.length > 0) {
      const deletePromises = validUrls.map((url) => deleteFileFromS3(url));
      await Promise.all(deletePromises);
      console.log(
        `Successfully attempted to delete ${validUrls.length} files from S3.`
      );
    }

    res.json({
      message: `Product with ID ${id} and associated files deleted successfully`,
    });
  } catch (error) {
    console.error("Critical Error during product deletion:", error);
    res
      .status(500)
      .json({ error: "Failed to complete product deletion process" });
  }
});
// แก้ไขสินค้าที่มีอยู่ 
//ใช้ upload.array เพื่อรองรับการอัปโหลดรูปใหม่ (สูงสุด 5 รูป)
router.put('/:id', upload.array('images', 5), async (req, res) => {
 const { id } = req.params;
 const { name, brand, description, price, stock, sizes, existing_image_urls } = req.body;
 const newFiles = req.files;

try {
 //ดึง URL รูปภาพเก่าจาก DB ก่อนทำการแก้ไข
 const [oldProductResults] = await db.promise().query("SELECT image_urls FROM products WHERE id = ?", [id]);

 if (oldProductResults.length === 0) {
 return res.status(404).json({ error: "Product not found" });
}
 
 const rawOldUrls = oldProductResults[0].image_urls;

        // 🔴 [จุดแก้ไขที่ 1] สร้างฟังก์ชันเพื่อจัดการการแปลงให้อยู่ในรูปแบบ Array เสมอ
        const convertToUrlArray = (value) => {
            if (!value) return [];
            
            
            if (Array.isArray(value)) {
                return value.flat(); //ใช้ .flat() เพื่อป้องกัน Array ซ้อน Array
            }
            
            //ถ้าเป็น JSON String
            if (isJsonString(value)) {
                return JSON.parse(value).flat();
            }
            
            //ถ้าเป็น String ธรรมดา ที่มี Comma หรือ URL เดี่ยว
            if (typeof value === 'string') {
                return value.split(',').map(s => s.trim());
            }
            
            return []; 
        };
        
        // แปลง URL เดิมทั้งหมดใน DB ให้อยู่ในรูป Array 1 มิติ
        let oldUrlsInDb = convertToUrlArray(rawOldUrls);

        // ใช้ Set เพื่อการค้นหาที่รวดเร็ว
        const oldUrlsSet = new Set(oldUrlsInDb.filter(url => url && typeof url === 'string')); 
        
        
        //จัดการ URL รูปภาพใหม่ทั้งหมดที่เหลืออยู่ในฟอร์ม
        
        //แยก URL รูปเก่าที่ยังเหลืออยู่ (ส่งมาจาก Frontend)
        let existingUrlsFromForm = [];
        if (existing_image_urls) {
            // ใช้ฟังก์ชันแปลงเพื่อจัดการรูปแบบที่ Frontend ส่งมาให้แน่ใจว่าเป็น Array
            existingUrlsFromForm = convertToUrlArray(existing_image_urls);
        }
        
        //อัปโหลดรูปภาพใหม่ไป S3
        const newUploadPromises = newFiles.map(file => uploadFileToS3(file));
        const newImageUrls = await Promise.all(newUploadPromises);

        //รวม URL ทั้งหมดรูปเก่าที่เหลือ + รูปใหม่
        const finalImageUrls = existingUrlsFromForm.concat(newImageUrls);
        
        
        //สั่งลบไฟล์ที่ไม่ใช้แล้วออกจากS3
        const urlsToDelete = [];
        for (const url of oldUrlsSet) {
            // ถ้ารูปเดิมอยู่ในDBแต่ไม่อยู่ในfinalImageUrlsหมายความว่าถูกลบออกจากฟอร์ม
            if (!finalImageUrls.includes(url)) {
                urlsToDelete.push(url);
            }
        }

        if (urlsToDelete.length > 0) {
            console.log(`Deleting ${urlsToDelete.length} unused files from S3...`);
            const deletePromises = urlsToDelete.map(url => deleteFileFromS3(url));
            await Promise.all(deletePromises);
        }


        //จัดการ Sizes และ อัปเดตข้อมูลในMySQL
        let sizesJSON = sizes;
        if (typeof sizes === 'string') {
            sizesJSON = JSON.stringify(sizes.split(',').map(s => s.trim()));
        } else if (Array.isArray(sizes)) {
            sizesJSON = JSON.stringify(sizes);
        }

        const sql = `
            UPDATE products 
            SET name = ?, brand = ?, description = ?, price = ?, stock = ?, image_urls = ?, sizes = ?
            WHERE id = ?
        `;
        const values = [
            name, 
            brand, 
            description, 
            price, 
            stock, 
            JSON.stringify(finalImageUrls),
            sizesJSON,
            id
        ];

        const [result] = await db.promise().query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Product not found or no changes made" });
        }

        res.json({ message: "Product updated successfully", productId: id, finalImageUrls });

    } catch (error) {
        console.error(`Critical Error in PUT /api/products/${id}:`, error);
        res.status(500).json({ error: 'Failed to update product or clean up old images' });
    }
});

// POST: New Product
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const { name, brand, description, price, stock, sizes } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      // อัปโหลดไฟล์ทั้งหมดไปยัง S3
      imageUrls = await Promise.all(
        req.files.map(async (file) => await uploadFileToS3(file))
      );
    }

    // แปลง sizes เป็น JSON ถ้าเป็น string
    let sizesJSON = sizes;
    if (typeof sizes === "string") {
      sizesJSON = JSON.stringify(sizes.split(",").map((s) => s.trim()));
    } else if (Array.isArray(sizes)) {
      sizesJSON = JSON.stringify(sizes);
    }

    const sql =
      "INSERT INTO products (name, brand, description, price, stock, image_urls, sizes) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [
      name,
      brand,
      description,
      price,
      stock,
      JSON.stringify(imageUrls),
      sizesJSON,
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error creating product in DB:", err);
        return res.status(500).json({ error: "Failed to create product" });
      }
      res.status(201).json({
        message: "Product created successfully",
        productId: result.insertId,
        imageUrls,
      });
    });
  } catch (error) {
    console.error("Error in POST /api/products/add:", error);
    res
      .status(500)
      .json({ error: "Failed to upload images or create product" });
  }
});

module.exports = router;
