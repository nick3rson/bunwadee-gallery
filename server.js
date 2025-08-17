const SECRET_PASSWORD = 'nick123'; // รหัสผ่านสำหรับอัปโหลด

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const app = express();

// ตั้งค่า Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage สำหรับ Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bunwadee',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'heic']
  },
});
const upload = multer({ storage });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// หน้าแรก
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// เก็บลิสต์รูป (ใน memory เท่านั้น)
let imagesList = [];

// อัปโหลดไฟล์
app.post('/upload', upload.single('image'), (req, res) => {
  const password = req.body.password;

  if (password !== SECRET_PASSWORD) {
    return res.status(403).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'ไม่มีไฟล์อัปโหลด' });
  }

  const url = req.file.path;   // Cloudinary URL
  const filename = req.file.filename;

  imagesList.push({ url, filename });

  res.json({ success: true, url, filename });
});

// ดึงรูปทั้งหมด
app.get('/images', (req, res) => {
  res.json(imagesList);
});

// ลบรูป
app.delete('/delete', async (req, res) => {
  const { filename, password } = req.body;

  if (password !== SECRET_PASSWORD) {
    return res.status(403).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }

  try {
    await cloudinary.uploader.destroy(`bunwadee/${filename}`);
    imagesList = imagesList.filter(img => img.filename !== filename);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ลบไฟล์ไม่สำเร็จ' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));let imagesList = []; 

// อัปโหลดรูป
app.post('/upload', upload.single('image'), (req, res) => {
  const password = req.body.password;

  if (password !== SECRET_PASSWORD) {
    return res.status(403).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'ไม่มีไฟล์อัปโหลด' });
  }

  // ส่ง URL กลับไป และเก็บไว้ใน array
  const url = req.file.path;      // Cloudinary URL
  const filename = req.file.filename;

  imagesList.push({ url, filename });

  res.json({ success: true, url, filename });
});

// ดึงรายการรูปทั้งหมด
app.get('/images', (req, res) => {
  res.json(imagesList);
});

// ลบรูปจาก Cloudinary และ memory
app.delete('/delete', async (req, res) => {
  const { filename, password } = req.body;

  if (password !== SECRET_PASSWORD) {
    return res.status(403).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }

  // ลบจาก Cloudinary
  try {
    await cloudinary.uploader.destroy(`bunwadee/${filename}`);
    // ลบจาก memory
    imagesList = imagesList.filter(img => img.filename !== filename);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ลบไฟล์ไม่สำเร็จ' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
