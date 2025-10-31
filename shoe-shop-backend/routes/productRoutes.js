const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadFileToS3,deleteFileFromS3  } = require("../utils/s3");
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

  // 🟢 [แก้ไข] ประกาศตัวแปร imageUrls ไว้ที่นี่ (นอก try/catch)
  let imageUrls = []; 
  let allUrlsToProcess = [];

  try {
        // 1. ดึง URL รูปภาพก่อนลบข้อมูลสินค้า
        const selectSql = "SELECT image_urls FROM products WHERE id = ?";
        // 💡 ใช้ db.promise().query หรือห่อ db.query ด้วย Promise
        const [productResults] = await db.promise().query(selectSql, [id]); 

        if (productResults.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        const rawImageUrls = productResults[0].image_urls;
        
        // 2. แปลง URL ที่เป็น JSON/String ให้เป็น Array 1 มิติ
        if (isJsonString(rawImageUrls)) {
            imageUrls = JSON.parse(rawImageUrls);
        } else if (rawImageUrls) {
            imageUrls = [rawImageUrls]; 
        }

        // 2.5. จัดการปัญหา URL ที่มี Comma คั่นจากข้อมูลเก่า (ป้องกันการลบไฟล์ S3 ล้มเหลว)
        allUrlsToProcess = imageUrls.flatMap(url => {
            if (typeof url === 'string' && url.includes(',')) {
                return url.split(',').map(s => s.trim());
            }
            return url; 
        });

        const validUrls = allUrlsToProcess.filter(url => url && typeof url === 'string');


        // 3. ลบข้อมูลสินค้าในฐานข้อมูล
        const deleteDbSql = "DELETE FROM products WHERE id = ?";
        const [deleteDbResult] = await db.promise().query(deleteDbSql, [id]);

        if (deleteDbResult.affectedRows === 0) {
            return res.status(404).json({ error: "Product not found (or already deleted)" });
        }
        
        // 4. ลบไฟล์จาก S3 (ทำงานพร้อมกัน)
        if (validUrls.length > 0) {
            const deletePromises = validUrls.map(url => deleteFileFromS3(url));
            await Promise.all(deletePromises);
            console.log(`Successfully attempted to delete ${validUrls.length} files from S3.`);
        }

        // 5. ตอบกลับสำเร็จ
        res.json({ message: `Product with ID ${id} and associated files deleted successfully` });

    } catch (error) {
        console.error("Critical Error during product deletion:", error);
        res.status(500).json({ error: "Failed to complete product deletion process" });
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
