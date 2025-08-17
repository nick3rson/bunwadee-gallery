const SECRET_PASSWORD = 'nick123'; // รหัสผ่านสำหรับอัปโหลด

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const app = express();

// Configuration Cloudinary
cloudinary.config({ 
    cloud_name: 'dmps2yaqs', 
    api_key: '269629145668394', 
    api_secret: '<your_api_secret>' // ใส่ API Secret จริง
});

// ใช้ CloudinaryStorage กับ multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bunwadee',           // โฟลเดอร์ใน Cloudinary
    allowed_formats: ['jpg','jpeg','png','gif','heic']
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

// เก็บ URL ของรูปทั้งหมดใน memory
let imagesList = []; 

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
