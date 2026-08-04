const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload folder (Vercel serverless mein /tmp use karein)
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Frontend page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>IQ Flix - Upload</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #0f0f0f;
          color: #fff;
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .container {
          background: #1a1a1a;
          padding: 40px;
          border-radius: 16px;
          text-align: center;
          max-width: 500px;
          width: 90%;
          border: 1px solid #ff6b00;
        }
        h2 {
          color: #ff6b00;
          margin-bottom: 20px;
          font-size: 1.8rem;
        }
        .drop-zone {
          border: 2px dashed #333;
          border-radius: 12px;
          padding: 40px 20px;
          margin: 20px 0;
          cursor: pointer;
          transition: 0.3s;
        }
        .drop-zone:hover {
          border-color: #ff6b00;
          background: rgba(255,107,0,0.05);
        }
        input[type="file"] {
          display: none;
        }
        button {
          background: #ff6b00;
          border: none;
          padding: 14px 40px;
          border-radius: 40px;
          color: #fff;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: 0.3s;
          width: 100%;
        }
        button:hover {
          background: #ff8c38;
          transform: scale(1.02);
        }
        #result {
          margin-top: 20px;
          padding: 12px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          word-break: break-all;
          display: none;
        }
        #result a {
          color: #ff6b00;
          text-decoration: none;
        }
        #result a:hover {
          text-decoration: underline;
        }
        .loading {
          display: none;
          color: #ff6b00;
          margin: 10px 0;
        }
        #fileInfo {
          color: #0f0;
          font-size: 0.9rem;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>📤 Upload Video</h2>
        <p style="color:#888;margin-bottom:16px;">Upload your video and get direct link</p>
        
        <div class="drop-zone" id="dropZone">
          <p style="font-size:2rem;margin-bottom:8px;">📁</p>
          <p>Click or drag & drop video here</p>
          <p style="color:#666;font-size:0.8rem;margin-top:8px;">MP4, MOV up to 100MB</p>
        </div>
        
        <input type="file" id="fileInput" accept="video/*">
        <div id="fileInfo"></div>
        
        <button id="uploadBtn">⬆ Upload Video</button>
        <div class="loading" id="loading">⏳ Uploading... Please wait</div>
        <div id="result"></div>
      </div>

      <script>
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const fileInfo = document.getElementById('fileInfo');
        const uploadBtn = document.getElementById('uploadBtn');
        const loading = document.getElementById('loading');
        const result = document.getElementById('result');

        let selectedFile = null;

        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropZone.style.borderColor = '#ff6b00';
        });
        dropZone.addEventListener('dragleave', () => {
          dropZone.style.borderColor = '#333';
        });
        dropZone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropZone.style.borderColor = '#333';
          if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFile(e.dataTransfer.files[0]);
          }
        });

        fileInput.addEventListener('change', (e) => {
          if (e.target.files.length) {
            handleFile(e.target.files[0]);
          }
        });

        function handleFile(file) {
          selectedFile = file;
          fileInfo.textContent = '📎 ' + file.name + ' (' + (file.size / 1024 / 1024).toFixed(2) + ' MB)';
          result.style.display = 'none';
        }

        uploadBtn.addEventListener('click', async () => {
          if (!selectedFile) {
            alert('Please select a video first!');
            return;
          }

          const formData = new FormData();
          formData.append('file', selectedFile);

          loading.style.display = 'block';
          uploadBtn.disabled = true;
          result.style.display = 'none';

          try {
            const response = await fetch('/upload', {
              method: 'POST',
              body: formData
            });

            const data = await response.json();

            if (response.ok && data.url) {
              result.innerHTML = '✅ <strong>Link:</strong><br><a href="' + data.url + '" target="_blank">' + data.url + '</a>';
              result.style.display = 'block';
              result.style.color = '#0f0';
            } else {
              result.innerHTML = '❌ Error: ' + (data.error || 'Upload failed');
              result.style.display = 'block';
              result.style.color = '#ff4444';
            }
          } catch (error) {
            result.innerHTML = '❌ Error: ' + error.message;
            result.style.display = 'block';
            result.style.color = '#ff4444';
          }

          loading.style.display = 'none';
          uploadBtn.disabled = false;
        });
      </script>
    </body>
    </html>
  `);
});

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : `${req.protocol}://${req.get('host')}`;
    
    const fileUrl = `${baseUrl}/files/${req.file.filename}`;
    res.json({ 
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
