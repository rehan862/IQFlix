const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Simple homepage
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>IQ Flix - Video Upload</title>
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
        h2 { color: #ff6b00; margin-bottom: 20px; }
        input[type="text"] {
          width: 100%;
          padding: 12px;
          background: #222;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 1rem;
          margin: 10px 0;
        }
        button {
          background: #ff6b00;
          border: none;
          padding: 14px 40px;
          border-radius: 40px;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          margin-top: 10px;
        }
        button:hover { background: #ff8c38; }
        #result {
          margin-top: 20px;
          padding: 12px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          word-break: break-all;
          display: none;
        }
        #result a { color: #ff6b00; text-decoration: none; }
        .info { color: #888; font-size: 0.8rem; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>📤 Video Link Generator</h2>
        <p class="info">Paste your video URL from Cloudinary/Vimeo</p>
        <input type="text" id="videoUrl" placeholder="https://res.cloudinary.com/.../video.mp4">
        <button id="generateBtn">✅ Generate Link</button>
        <div id="result"></div>
        <p class="info" style="margin-top:20px;color:#666;">
          💡 Upload video on <a href="https://cloudinary.com" target="_blank" style="color:#ff6b00;">Cloudinary</a> 
          or <a href="https://vimeo.com" target="_blank" style="color:#ff6b00;">Vimeo</a> and paste link here
        </p>
      </div>
      <script>
        document.getElementById('generateBtn').addEventListener('click', function() {
          const url = document.getElementById('videoUrl').value.trim();
          const result = document.getElementById('result');
          
          if (!url) {
            result.innerHTML = '❌ Please enter a video URL';
            result.style.display = 'block';
            result.style.color = '#ff4444';
            return;
          }
          
          // Check if it's a valid URL
          try {
            new URL(url);
            result.innerHTML = '✅ <strong>Your Video Link:</strong><br><a href="' + url + '" target="_blank">' + url + '</a>';
            result.style.display = 'block';
            result.style.color = '#0f0';
          } catch(e) {
            result.innerHTML = '❌ Invalid URL. Please enter a valid link';
            result.style.display = 'block';
            result.style.color = '#ff4444';
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running!' });
});

module.exports = app;
