const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.static('public'));

// Upload folder create karein
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send('No file uploaded');
  const fileUrl = `https://${req.get('host')}/files/${file.filename}`;
  res.json({ url: fileUrl, message: 'Upload successful!' });
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

// Frontend upload page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>DirectLink - Upload</title>
      <style>
        body { font-family: Arial; background: #0f0f0f; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .container { background: #1a1a1a; padding: 40px; border-radius: 16px; text-align: center; border: 1px solid #ff6b00; }
        h2 { color: #ff6b00; }
        input[type="file"] { margin: 20px 0; padding: 10px; background: #222; border: 1px solid #333; color: #fff; border-radius: 8px; }
        button { background: #ff6b00; border: none; padding: 12px 30px; border-radius: 40px; color: #fff; font-weight: 600; cursor: pointer; font-size: 1rem; }
        button:hover { background: #ff8c38; }
        #result { margin-top: 20px; color: #0f0; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>📤 Upload Video</h2>
        <form id="uploadForm" enctype="multipart/form-data">
          <input type="file" name="file" accept="video/*" required>
          <br>
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
          document.getElementById('result').innerHTML = '✅ Link: <a href="' + data.url + '" target="_blank">' + data.url + '</a>';
        };
      </script>
    </body>
    </html>
  `);
});

app.listen(3000, () => console.log('Server running on port 3000'));
