const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadFileToS3, deleteFileFromS3 } = require("../utils/s3"); //
const db = require("../config/db"); // (นี่คือ .promise() ที่เราแก้แล้ว [previous step])

const storage = multer.memoryStorage();
const upload = multer({ storage });

//Helper (โค้ดเดิมของเพื่อน)
function isJsonString(str) {
  if (typeof str !== "string") return false;
  try {
    const parsed = JSON.parse(str);
    return parsed && typeof parsed === "object";
  } catch (e) {
    return false;
  }
}

// GET: All Products (แก้แล้ว)
router.get("/", async (req, res) => { // 👈 1. เพิ่ม async
  try {
    const sql = "SELECT * FROM products";
    const [results] = await db.query(sql); // 👈 2. ใช้ await

    const products = results.map((p) => ({
      ...p,
      image_urls: isJsonString(p.image_urls)
        ? JSON.parse(p.image_urls)
        : p.image_urls
        ? [p.image_urls]
        : [],
    }));
    res.json(products);
  } catch (err) { // 👈 3. เพิ่ม try/catch
    console.error("Error fetching products:", err);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
});

//GET: Product by ID (แก้แล้ว)
router.get("/:id", async (req, res) => { // 👈 1. เพิ่ม async
  try {
    const { id } = req.params;
    const sql = "SELECT * FROM products WHERE id = ?";
    const [results] = await db.query(sql, [id]); // 👈 2. ใช้ await

    if (results.length === 0)
      return res.status(404).json({ error: "Product not found" });

    const product = results[0];
    const formatted = {
      ...product,
      image_urls: isJsonString(product.image_urls)
        ? JSON.parse(product.image_urls)
        : product.image_urls
        ? [product.image_urls]
        : [],
      sizes: Array.isArray(product.sizes) 
        ? product.sizes 
        : isJsonString(product.sizes)
        ? JSON.parse(product.sizes) 
        : product.sizes
        ? [product.sizes] 
        : [],
    };
    res.json(formatted);
  } catch (err) { // 👈 3. เพิ่ม try/catch
    console.error("Error fetching product by id:", err);
    return res.status(500).json({ error: "Failed to fetch product" });
  }
});

//Delete Product (โค้ดเดิมของเพื่อนดีอยู่แล้ว)
router.delete("/:id", async (req, res) => {
  //... (โค้ดส่วนนี้ของเพื่อนดีอยู่แล้ว)
  const { id } = req.params;
  let imageUrls = [];
  let allUrlsToProcess = [];
  try {
    const selectSql = "SELECT image_urls FROM products WHERE id = ?";
    const [productResults] = await db.query(selectSql, [id]);
    if (productResults.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const rawImageUrls = productResults[0].image_urls;
    if (isJsonString(rawImageUrls)) {
      imageUrls = JSON.parse(rawImageUrls);
    } else if (rawImageUrls) {
      imageUrls = [rawImageUrls];
    }
    allUrlsToProcess = imageUrls.flatMap((url) => {
      if (typeof url === "string" && url.includes(",")) {
        return url.split(",").map((s) => s.trim());
      }
      return url;
    });
    const validUrls = allUrlsToProcess.filter(
      (url) => url && typeof url === "string"
    );
    const deleteDbSql = "DELETE FROM products WHERE id = ?";
    const [deleteDbResult] = await db.query(deleteDbSql, [id]);
    if (deleteDbResult.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Product not found (or already deleted)" });
    }
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
    
// แก้ไขสินค้าที่มีอยู่ (โค้ดเดิมของเพื่อนดีอยู่แล้ว)
router.put('/:id', upload.array('images', 5), async (req, res) => {
  //... (โค้ดส่วนนี้ของเพื่อนดีอยู่แล้ว)
 const { id } = req.params;
 const { name, brand, description, price, stock, sizes, existing_image_urls, category } = req.body;
 const newFiles = req.files;
try {
 const [oldProductResults] = await db.query("SELECT image_urls FROM products WHERE id = ?", [id]);
 if (oldProductResults.length === 0) {
 return res.status(404).json({ error: "Product not found" });
}
 const rawOldUrls = oldProductResults[0].image_urls;
        const convertToUrlArray = (value) => {
            if (!value) return [];
            if (Array.isArray(value)) {
                return value.flat();
            }
            if (isJsonString(value)) {
                return JSON.parse(value).flat();
            }
            if (typeof value === 'string') {
                return value.split(',').map(s => s.trim());
            }
            return []; 
        };
        let oldUrlsInDb = convertToUrlArray(rawOldUrls);
        const oldUrlsSet = new Set(oldUrlsInDb.filter(url => url && typeof url === 'string')); 
        let existingUrlsFromForm = [];
        if (existing_image_urls) {
            existingUrlsFromForm = convertToUrlArray(existing_image_urls);
        }
        const newUploadPromises = newFiles.map(file => uploadFileToS3(file));
        const newImageUrls = await Promise.all(newUploadPromises);
        const finalImageUrls = existingUrlsFromForm.concat(newImageUrls);
        const urlsToDelete = [];
        for (const url of oldUrlsSet) {
            if (!finalImageUrls.includes(url)) {
                urlsToDelete.push(url);
            }
        }
        if (urlsToDelete.length > 0) {
            console.log(`Deleting ${urlsToDelete.length} unused files from S3...`);
            const deletePromises = urlsToDelete.map(url => deleteFileFromS3(url));
            await Promise.all(deletePromises);
        }
        let sizesJSON = sizes;
        if (typeof sizes === 'string') {
            sizesJSON = JSON.stringify(sizes.split(',').map(s => s.trim()));
        } else if (Array.isArray(sizes)) {
            sizesJSON = JSON.stringify(sizes);
        }
        const sql = `
            UPDATE products 
            SET name = ?, brand = ?, category = ? ,description = ?, price = ?, stock = ?, image_urls = ?, sizes = ?
            WHERE id = ?
        `;
        const values = [
            name, brand, category, description, price, stock, 
            JSON.stringify(finalImageUrls),
            sizesJSON,
            id
        ];
        const [result] = await db.query(sql, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Product not found or no changes made" });
        }
        res.json({ message: "Product updated successfully", productId: id, finalImageUrls });
  } catch (error) {
        console.error(`Critical Error in PUT /api/products/${id}:`, error);
        res.status(500).json({ error: 'Failed to update product or clean up old images' });
  }
});

// POST: New Product (แก้แล้ว)
router.post("/", upload.array("images", 5), async (req, res) => { // 👈 1. มี async อยู่แล้ว
  try {
    const { name, brand, description, price, stock, sizes,category } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map(async (file) => await uploadFileToS3(file))
      );
    }

    let sizesJSON = sizes;
    if (typeof sizes === "string") {
      sizesJSON = JSON.stringify(sizes.split(",").map((s) => s.trim()));
    } else if (Array.isArray(sizes)) {
      sizesJSON = JSON.stringify(sizes);
    }

    const sql =
      "INSERT INTO products (name, brand, category, description, price, stock, image_urls, sizes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      name,
      brand,
      category,
      description,
      price,
      stock,
      JSON.stringify(imageUrls),
      sizesJSON,
    ];

    const [result] = await db.query(sql, values); // 👈 2. ใช้ await

    res.status(201).json({ // 👈 3. ย้ายมาไว้ใน try
      message: "Product created successfully",
      productId: result.insertId,
      imageUrls,
    });
  
  } catch (err) { // 👈 4. ใช้ catch
    console.error("Error creating product in DB:", err);
    return res.status(500).json({ error: "Failed to create product" });
  }
});

module.exports = router;