require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const pool = require('./db/connection'); 

const app = express();
const port = process.env.PORT || 3000; 

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Body parser middlewares with size limits
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

const allowedOrigins = [
  'http://localhost:3001', 
  'http://localhost:3000', 
  'https://carbon-calculator-five.vercel.app',
  'https://carbon-calculator-nqiof5s12-tanyas-projects-8b9fe25e.vercel.app', // Add this new URL
  process.env.FRONTEND_URL,
  'https://*.vercel.app',
];

// Remove undefined/null values and duplicates
const filteredOrigins = [...new Set(allowedOrigins.filter(origin => origin))];

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
  optionsSuccessStatus: 200
}));

// Add OPTIONS handler for preflight requests
app.options('*', cors());

// Route imports
const adminRoutes = require('./Routes/Admin');
const authRoutes = require('./Routes/auth');
const userRoutes = require('./Routes/User');
const aboutRoutes = require('./Routes/info');
const offsetRoutes = require('./Routes/Offset');
const formRoutes = require('./Routes/formRoutes');

// Route middleware
app.use('/api/admin', adminRoutes);   
app.use('/api/auth', authRoutes);     
app.use('/api/user', userRoutes);    
app.use('/api/about', aboutRoutes);
app.use('/api/details', offsetRoutes);
app.use('/api/form', formRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Carbon Calculator API is running!',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      user: '/api/user',
      about: '/api/about',
      details: '/api/details',
      form: '/api/form'
    }
  });
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Database test endpoint
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS currentTime, VERSION() AS version;');
    res.json({ 
      success: true, 
      currentTime: rows[0].currentTime,
      mysqlVersion: rows[0].version,
      connectionStatus: 'Connected'
    });
  } catch (err) {
    console.error('Database test error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      connectionStatus: 'Failed'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Handle CORS errors specifically
  if (err.message && err.message.includes('Not allowed by CORS')) {
    return res.status(403).json({ 
      error: 'CORS policy violation',
      origin: req.get('Origin')
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 CORS enabled for origins: ${filteredOrigins.join(', ')}`);
});

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  console.log(`📤 ${signal} received, shutting down gracefully`);
  server.close(() => {
    console.log('👋 HTTP server closed');
    
    // Close database pool
    pool.end().then(() => {
      console.log('🔌 Database pool closed');
      process.exit(0);
    }).catch((err) => {
      console.error('Error closing database pool:', err);
      process.exit(1);
    });
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught exception:', err);
  process.exit(1);
});