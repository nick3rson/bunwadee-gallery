require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const SECRET_PASSWORD = 'nick123'; // รหัสผ่านสำหรับอัปโหลด

// Cloudinary configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer + CloudinaryStorage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bunwadee',
    allowed_formats: ['jpg','jpeg','png','gif','heic'],
  },
});
const upload = multer({ storage });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// หน้าแรก
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// อัปโหลดรูป
app.post('/upload', upload.single('image'), (req, res) => {
  const password = req.body.password;
  if (password !== SECRET_PASSWORD) {
    return res.status(403).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }
  if (!req.file) return res.status(400).json({ error: 'ไม่มีไฟล์อัปโหลด' });

  res.json({ success: true, url: req.file.path, public_id: req.file.filename });
});

// ดึงรายการรูปทั้งหมดจาก Cloudinary folder 'bunwadee'
app.get('/images', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({ 
      type: 'upload',
      prefix: 'bunwadee/',
      max_results: 100,
    });
    // ส่ง array ของ object { url, public_id }
    const images = result.resources.map(img => ({
      url: img.secure_url,
      public_id: img.public_id
    }));
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'ดึงรูปไม่สำเร็จ' });
  }
});

// ลบรูป
app.delete('/delete', async (req, res) => {
  const { public_id, password } = req.body;
  if (password !== SECRET_PASSWORD) return res.status(403).json({ error: 'รหัสผ่านไม่ถูกต้อง' });

  try {
    await cloudinary.uploader.destroy(public_id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ลบไฟล์ไม่สำเร็จ' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
