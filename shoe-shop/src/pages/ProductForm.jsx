import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductForm.css";

const ProductForm = () => {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sizes, setSizes] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("รองเท้าวิ่ง");
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError("สามารถอัปโหลดได้สูงสุด 5 รูปเท่านั้น");
      return;
    }

    setImageFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (imageFiles.length === 0) {
      setError("กรุณาเลือกรูปภาพอย่างน้อย 1 รูป");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("brand", brand);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("sizes", sizes);

    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถเพิ่มสินค้าได้");

      alert("เพิ่มสินค้าสำเร็จ!");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container container">
      <h2>เพิ่มสินค้าใหม่</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">ชื่อสินค้า</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="brand">แบรนด์</label>
          <input
            id="brand"
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
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="sizes">ไซส์ (เช่น 38,39,40)</label>
          <input
            id="sizes"
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="images">รูปภาพสินค้า (สูงสุด 5 รูป)</label>
          <input
            type="file"
            id="images"
            name="images"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            required
          />
        </div>

        {/* ✅ Preview รูป */}
        {previewImages.length > 0 && (
          <div className="image-preview-container">
            {previewImages.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`preview ${index + 1}`}
                className="image-preview"
              />
            ))}
          </div>
        )}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "กำลังบันทึก..." : "บันทึกสินค้า"}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
