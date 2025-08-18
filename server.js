<<<<<<< HEAD
const SECRET_PASSWORD = 'nick123';

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });

// ตั้งค่า Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.API_SECRET || process.env.CLOUDINARY_API_SECRET,
});

=======
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
>>>>>>> 8a99a503b748b8ab75c6489777775bf5c2707432
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// ส่งหน้า index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// อัปโหลดรูป
app.post('/upload', upload.single('image'), async (req, res) => {
  const password = req.body.password;
  if (password !== SECRET_PASSWORD) {
    return res.status(403).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }
  if (!req.file) return res.status(400).json({ error: 'ไม่มีไฟล์อัปโหลด' });

<<<<<<< HEAD
  try {
    const filePath = req.file.path;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'image',
      format: 'jpg', // แปลง HEIC → JPG
    });

    fs.unlinkSync(filePath); // ลบไฟล์ชั่วคราว

    res.json({
      success: true,
      url: result.secure_url,
      filename: result.public_id + '.' + result.format // ✅ filename พร้อมนามสกุล
    });
=======
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
>>>>>>> 8a99a503b748b8ab75c6489777775bf5c2707432
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

// ดึงรูปทั้งหมดจาก Cloudinary
app.get('/images', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      resource_type: 'image',
      type: 'upload',
      max_results: 100
    });

    const images = result.resources.map(img => ({
      url: img.secure_url,
      filename: img.public_id + '.' + img.format // ✅ ส่งกลับพร้อมนามสกุลไฟล์
    }));

    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cannot fetch images: ' + err.message });
  }
});



app.delete('/delete', async (req, res) => {
  const { public_id, password } = req.body;

  if (!public_id) return res.status(400).json({ error: 'Missing public_id' });
  if (password !== SECRET_PASSWORD) return res.status(403).json({ error: 'รหัสผ่านไม่ถูกต้อง' });

  try {
    const result = await cloudinary.uploader.destroy(public_id, { resource_type: 'image' });
    console.log('Cloudinary delete result:', result);

    if (result.result === 'ok') res.json({ success: true });
    else if (result.result === 'not found') res.status(404).json({ error: 'ไฟล์ไม่พบบน Cloudinary' });
    else res.status(500).json({ error: 'ลบไม่สำเร็จ: ' + result.result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ลบไฟล์ไม่สำเร็จ: ' + err.message });
  }
});


const PORT = process.env.PORT || 3000;
<<<<<<< HEAD
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
=======
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
>>>>>>> 8a99a503b748b8ab75c6489777775bf5c2707432
