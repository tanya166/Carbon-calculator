require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const pool = require('./db/connection'); 

const app = express();
const port = process.env.PORT || 3000; 

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Updated CORS configuration
const allowedOrigins = [
  'http://localhost:3001', 
  'http://localhost:3000', 
  'https://carbon-calculator-five.vercel.app',  // Your Vercel frontend
  process.env.FRONTEND_URL,                     // From Railway environment variable
  'https://*.vercel.app',                       // All Vercel preview deployments
];

// Remove undefined/null values
const filteredOrigins = allowedOrigins.filter(origin => origin);

console.log('🌍 CORS enabled for origins:', filteredOrigins);

app.use(cors({
  origin: function (origin, callback) {
    console.log('🔍 Request origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or contains vercel.app
    const isAllowed = filteredOrigins.some(allowedOrigin => {
      if (allowedOrigin === origin) return true;
      if (allowedOrigin === 'https://*.vercel.app' && origin.includes('vercel.app')) return true;
      return false;
    });
    
    if (isAllowed || process.env.NODE_ENV === 'development') {
      console.log('✅ CORS allowed for:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked for:', origin);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Add OPTIONS handler for preflight requests
app.options('*', cors());

const adminRoutes = require('./Routes/Admin');
const authRoutes = require('./Routes/auth');
const userRoutes = require('./Routes/User');
const aboutRoutes = require('./Routes/info');
const offsetRoutes = require('./Routes/Offset');
const formRoutes = require('./Routes/formRoutes');

app.use('/api/admin', adminRoutes);   
app.use('/api/auth', authRoutes);     
app.use('/api/user', userRoutes);    
app.use('/api/about', aboutRoutes);
app.use('/api/details', offsetRoutes);
app.use('/api/form', formRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Carbon Calculator API is running!',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    allowedOrigins: filteredOrigins
  });
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS currentTime;');
    res.json({ success: true, currentTime: rows[0].currentTime });
  } catch (err) {
    console.error('Database test error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Capture server instance for graceful shutdown
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 CORS enabled for origins: ${filteredOrigins.join(', ')}`);
});

process.on('SIGTERM', () => {
  console.log('📤 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('👋 Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled rejection:', err);
});