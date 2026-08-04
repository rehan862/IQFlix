const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());

// Vercel serverless mein /tmp folder use karein
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Frontend
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>DirectLink</title>
    <style>
      body{background:#0f0f0f;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial}
      .box{background:#1a1a1a;padding:40px;border-radius:16px;text-align:center;border:1px solid #ff6b00}
      h2{color:#ff6b00}
      input[type="file"]{margin:16px 0;padding:10px;background:#222;border:1px solid #333;color:#fff;border-radius:8px}
      button{background:#ff6b00;border:none;padding:12px 30px;border-radius:40px;color:#fff;font-weight:600;cursor:pointer}
      #result{margin-top:16px;word-break:break-all}
    </style>
    </head>
    <body>
    <div class="box">
      <h2>📤 Upload Video</h2>
      <form id="uploadForm" enctype="multipart/form-data">
        <input type="file" name="file" accept="video/*" required><br>
        <button type="submit">Upload</button>
      </form>
      <div id="result"></div>
    </div>
    <script>
      document.getElementById('uploadForm').onsubmit = async (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const res = await fetch('/upload', { method: 'POST', body: form });
        const data = await res.json();
        document.getElementById('result').innerHTML = '✅ <a href="' + data.url + '" target="_blank">' + data.url + '</a>';
      };
    </script>
    </body>
    </html>
  `);
});

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `${req.protocol}://${req.get('host')}/files/${req.file.filename}`;
  res.json({ url });
});

// Serve files
app.get('/files/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.status(404).send('File not found');
  }
});

// For Vercel
module.exports = app;
