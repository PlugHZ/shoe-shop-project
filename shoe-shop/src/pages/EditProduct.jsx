import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductForm.css";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sizes, setSizes] = useState("");

  const [existingImages, setExistingImages] = useState([]); // URL รูปเก่าที่ยังอยู่
  const [newImageFiles, setNewImageFiles] = useState([]); // ไฟล์รูปใหม่ที่กำลังจะอัปโหลด
  const [previewNewImages, setPreviewNewImages] = useState([]); // สำหรับแสดงพรีวิวรูปใหม่

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  //โหลดข้อมูลสินค้าเก่าเมื่อเข้าหน้า
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/products/${id}`
        );
        if (!response.ok) throw new Error("Product not found");
        const data = await response.json();

        setName(data.name || "");
        setBrand(data.brand || "");
        setCategory(data.category || "รองเท้าวิ่ง");
        setDescription(data.description || "");
        setPrice(data.price || "");
        setStock(data.stock || "");

        setSizes(Array.isArray(data.sizes) ? data.sizes.join(", ") : "");

        // ตั้งค่า URL รูปภาพเก่าที่มีอยู่
        const cleanedImageUrls = Array.isArray(data.image_urls[0])
          ? data.image_urls[0].filter(Boolean)
          : data.image_urls.filter(Boolean);

        setExistingImages(cleanedImageUrls || []);
      } catch (err) {
        setError("Failed to load product data.");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  //จัดการรูปภาพใหม่แสดงพรีวิว
  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImageFiles(files);

    // สร้าง URL สำหรับ Preview รูปใหม่
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewNewImages(previewUrls);
  };

  //จัดการลบรูปเก่าออกจากฟอร์ม
  const handleRemoveExistingImage = (urlToRemove) => {
    // ลบ URL
    setExistingImages((prev) => prev.filter((url) => url !== urlToRemove));
  };

  //การส่งฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("brand", brand);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("sizes", sizes);

    //ส่ง URL รูปเก่าที่ยังเหลืออยู่ ไปให้ Backend
    formData.append("existing_image_urls", JSON.stringify(existingImages));

    //เพิ่มไฟล์รูปใหม่ทั้งหมด
    newImageFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch(`http://localhost:3001/api/products/${id}`, {
        method: "PUT", //ใช้PUTสำหรับการแก้ไข
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update product");
      }

      alert("แก้ไขสินค้าสำเร็จ!");
      navigate(`/product/${id}`); // กลับไปหน้าสินค้าที่แก้ไข
    } catch (err) {
      setError(err.message || "Failed to submit form");
      console.error("Error submitting form:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <h2 className="container" style={{ padding: "3rem 0" }}>
        กำลังโหลดข้อมูลเก่า...
      </h2>
    );
  if (error)
    return (
      <h2 className="container" style={{ padding: "3rem 0", color: "red" }}>
        {error}
      </h2>
    );

  return (
    <div className="product-form-container container">
      <h2>แก้ไขสินค้า: {name}</h2>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">ชื่อสินค้า</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="brand">แบรนด์</label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">ประเภทสินค้า</label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="รองเท้าวิ่ง">รองเท้าวิ่ง</option>
            <option value="รองเท้าฟุตบอล">รองเท้าฟุตบอล</option>
            <option value="รองเท้าลำลอง">รองเท้าลำลอง</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">รายละเอียด</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="price">ราคา (บาท)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="stock">จำนวนในสต็อก</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="sizes">ไซส์ (คั่นด้วยเครื่องหมายจุลภาค , )</label>
          <input
            type="text"
            id="sizes"
            name="sizes"
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
            placeholder="เช่น 38,39,40,41"
            required
          />
        </div>

        {/*แสดงรูปภาพเดิมและปุ่มลบ */}
        <div className="form-group">
          <label>รูปภาพปัจจุบัน (คลิกเพื่อลบ)</label>
          <div className="image-preview-container existing-images">
            {existingImages.map((url, index) => (
              <div key={index} className="image-preview-wrapper">
                <img
                  src={url}
                  alt={`Existing ${index + 1}`}
                  className="image-preview"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(url)}
                  className="remove-image-btn"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>

        {/*อัปโหลดรูปภาพใหม่ */}
        <div className="form-group">
          <label htmlFor="new-images">อัปโหลดรูปภาพเพิ่มเติม/แทนที่</label>
          <input
            type="file"
            id="new-images"
            name="images"
            onChange={handleNewImageChange}
            multiple
            accept="image/*"
          />
        </div>

        {/*พรีวิวรูปภาพใหม่ */}
        {previewNewImages.length > 0 && (
          <div className="form-group">
            <label>พรีวิวรูปภาพใหม่</label>
            <div className="image-preview-container new-images">
              {previewNewImages.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`New Preview ${index + 1}`}
                  className="image-preview"
                />
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
