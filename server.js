const SECRET_PASSWORD = 'nick123'; // รหัสผ่านที่ใช้สำหรับอัพโหลดไฟล์

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const heicConvert = require('heic-convert'); // <--- ย้ายมาอยู่บนสุด
const app = express();

app.use(express.static('public')); // โฟลเดอร์ frontend (html, css, js)
app.use('/uploads', express.static('uploads')); // ให้เข้าถึงไฟล์อัพโหลดได้

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ตั้งค่า multer ให้ตั้งชื่อไฟล์จาก req.body.filename + timestamp
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const originalExt = path.extname(file.originalname);
    const customName = req.body.filename ? req.body.filename.replace(/\s+/g, '_') : 'file';
    const uniqueSuffix = Date.now();
    cb(null, `${customName}_${uniqueSuffix}${originalExt}`);
  }
});

const upload = multer({ storage });

// หน้าแรก
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: ส่งรายการไฟล์ทั้งหมดใน uploads
app.get('/images', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) return res.status(500).json({ error: 'Cannot read files' });
    res.json(files);
  });
});

// API: อัพโหลดไฟล์
app.post('/upload', upload.single('image'), async (req, res) => {
  const password = req.body.password;

  if (!req.file) {
    return res.status(400).json({ error: 'ไม่มีไฟล์อัปโหลด' });
  }

  if (password !== SECRET_PASSWORD) {
    fs.unlinkSync(req.file.path);
    return res.status(403).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }

  // แปลง HEIC เป็น JPEG ถ้าไฟล์ HEIC
  const ext = path.extname(req.file.filename).toLowerCase();
  if (ext === '.heic') {
    const inputBuffer = fs.readFileSync(req.file.path);
    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 1
    });

    const newFilename = req.file.filename.replace('.heic', '.jpg');
    fs.writeFileSync(path.join('uploads', newFilename), outputBuffer);

    fs.unlinkSync(req.file.path); // ลบ HEIC ต้นฉบับ
    req.file.filename = newFilename; // อัปเดตชื่อไฟล์
  }

   res.json({ success: true, filename: req.file.filename });
});

// API: ลบไฟล์
app.delete('/delete', (req, res) => {
  const { filename, password } = req.body;

  if (password !== SECRET_PASSWORD) {
    return res.status(403).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }

  const filepath = path.join(__dirname, 'uploads', filename);
  fs.unlink(filepath, (err) => {
    if (err) return res.status(500).json({ error: 'ลบไฟล์ไม่สำเร็จ' });
    res.json({ success: true });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
