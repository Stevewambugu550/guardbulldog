require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

const app = express();

// Database connection check
pool.query('SELECT NOW()')
  .then(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Database connected successfully');
    }
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  });

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'https://guardbulldog.netlify.app'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Define Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>GuardBulldog API</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .container { background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; backdrop-filter: blur(10px); }
        h1 { font-size: 3em; margin: 0; }
        .status { color: #4ade80; font-size: 1.2em; margin: 20px 0; }
        .endpoints { background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; }
        .endpoint { margin: 10px 0; font-family: monospace; }
        a { color: #60a5fa; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🛡️ GuardBulldog API</h1>
        <p class="status">✅ API Server Running Successfully</p>
        <p>This is the backend API for the GuardBulldog Phishing Protection Platform.</p>
        
        <div class="endpoints">
          <h3>Available Endpoints:</h3>
          <div class="endpoint">GET /api/health - Health check</div>
          <div class="endpoint">POST /api/auth/register - User registration</div>
          <div class="endpoint">POST /api/auth/login - User login</div>
          <div class="endpoint">POST /api/reports - Submit report</div>
          <div class="endpoint">POST /api/guest/submit - Guest report submission</div>
          <div class="endpoint">GET /api/education/modules - Education modules</div>
        </div>
        
        <p><strong>Frontend Website:</strong> <a href="https://guardbulldog.netlify.app">https://guardbulldog.netlify.app</a></p>
        <p><strong>GitHub:</strong> <a href="https://github.com/Stevewambugu550/guardbulldog">View Repository</a></p>
      </div>
    </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'GUARDBULLDOG API is running' });
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/guest', require('./routes/guestRoutes'));
app.use('/api/intelligence', require('./routes/intelligenceRoutes'));
app.use('/api/education', require('./routes/education'));
app.use('/api/inquiry', require('./routes/inquiry'));
app.use('/api/messages', require('./routes/messages'));

// 404 Handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🛡️  GuardBulldog API Server`);
  console.log(`📡 Running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Keep-alive ping for production hosting
  if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
    const SELF_URL = process.env.RENDER_EXTERNAL_URL;
    setInterval(() => {
      const https = require('https');
      https.get(`${SELF_URL}/api/health`, (res) => {
        if (res.statusCode !== 200) {
          console.error(`Keep-alive failed: ${res.statusCode}`);
        }
      }).on('error', (err) => {
        console.error('Keep-alive error:', err.message);
      });
    }, 14 * 60 * 1000);
  }
});
