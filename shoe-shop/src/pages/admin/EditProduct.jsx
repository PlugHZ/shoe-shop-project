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
  const [newImageFiles, setNewImageFiles] = useState([]); // ไฟล์รูปใหม่ที่เลือกเพิ่ม
  const [previewNewImages, setPreviewNewImages] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  //โหลดข้อมูลสินค้าเก่าเมื่อเข้าหน้า
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/${id}`,
        );
        if (!response.ok) throw new Error("ไม่พบข้อมูลสินค้า");
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
        setError("ไม่สามารถโหลดข้อมูลสินค้าได้");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  // จัดการเลือกรูปใหม่เพิ่ม
  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    // ตรวจสอบจำนวนรวม
    if (existingImages.length + newImageFiles.length + files.length > 5) {
      setError("สินค้านี้สามารถมีรูปได้สูงสุด 5 รูปเท่านั้น");
      e.target.value = null;
      return;
    }
    setNewImageFiles((prev) => [...prev, ...files]);

    // สร้าง URL สำหรับ Preview รูปใหม่
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewNewImages((prev) => [...prev, ...previewUrls]);
    e.target.value = null;
    setError("");
  };

  //ลบรูปเก่าออก
  const handleRemoveExistingImage = (urlToRemove) => {
    // ลบ URL
    setExistingImages((prev) => prev.filter((url) => url !== urlToRemove));
  };
  //ลบรูปใหม่ที่เลือกมาออก
  const removeNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewNewImages[index]);
    setPreviewNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  //การส่งฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (existingImages.length + newImageFiles.length === 0) {
      setError("กรุณาให้มีรูปภาพเหลืออยู่อย่างน้อย 1 รูป");
      return;
    }
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`,
        {
          method: "PUT", //ใช้PUTสำหรับการแก้ไข
          body: formData,
        },
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update product");
      }

      alert("แก้ไขสินค้าสำเร็จ!");
      navigate(`/product/${id}`); // กลับไปหน้าสินค้าที่แก้ไข
    } catch (err) {
      setError(err.message);
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
            <option value="รองเท้าฟุตซอล">รองเท้าฟุตซอล</option>
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

        {/* รูปเก่าในระบบ */}
        <div className="form-group">
          <label>รูปภาพปัจจุบัน (ในระบบ)</label>
          <div className="image-preview-container">
            {existingImages.map((url, index) => (
              <div key={`existing-${index}`} className="preview-item">
                <img
                  src={url}
                  alt={`Existing ${index + 1}`}
                  className="image-preview"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(url)}
                  className="remove-image-btn"
                  title="ลบรูปเดิม"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* เลือกรูปใหม่ */}
        <div className="form-group">
          <label htmlFor="new-images">
            อัปโหลดรูปภาพเพิ่มเติม (สูงสุดรวม 5 รูป)
          </label>
          <input
            type="file"
            id="new-images"
            multiple
            accept="image/*"
            onChange={handleNewImageChange}
          />
        </div>

        {/* พรีวิวรูปใหม่ */}
        {previewNewImages.length > 0 && (
          <div className="form-group">
            <label>พรีวิวรูปภาพใหม่ที่กำลังจะเพิ่ม</label>
            <div className="image-preview-container">
              {previewNewImages.map((url, index) => (
                <div key={`new-${index}`} className="preview-item">
                  <img
                    src={url}
                    alt={`New Preview ${index + 1}`}
                    className="image-preview"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="remove-image-btn"
                    title="ลบรูปใหม่"
                  >
                    ✕
                  </button>
                </div>
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
