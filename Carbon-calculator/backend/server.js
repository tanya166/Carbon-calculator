// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// const port = process.env.PORT || 3000;
// // Middlewares
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use(cors({
//   origin: 'http://localhost:3001',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));


// const adminRoutes = require('./Routes/Admin');
// const authRoutes = require('./Routes/auth');
// const userRoutes = require('./Routes/User');
// const aboutRoutes = require('./Routes/info');
// const offsetRoutes = require('./Routes/Offset');
// const formRoutes = require('./Routes/formRoutes');

// app.use('/api/admin', adminRoutes);   
// app.use('/api/auth', authRoutes);     
// app.use('/api/user', userRoutes);    
// app.use('/api/about', aboutRoutes);
// app.use('/api/details', offsetRoutes);
// app.use('/api/form', formRoutes);

// app.get('/', (req, res) => {
//   res.json({ message: 'Server is running!' });
// });


// app.use('*', (req, res) => {
//   res.status(404).json({ error: 'Route not found' });
// });

// // app.use((err, req, res, next) => {
// //   console.error('Unhandled error:', err);
// //   res.status(500).json({ error: 'Internal server error' });
// // });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });


require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; // Railway will provide PORT environment variable

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Updated CORS configuration for deployment
const allowedOrigins = [
  'http://localhost:3001', // For local development
  'http://localhost:3000', // Alternative local port
  process.env.FRONTEND_URL, // Your deployed frontend URL (set this in Railway env vars)
  // Add more allowed origins as needed
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
});

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS currentTime;');
    res.json({ success: true, currentTime: rows[0].currentTime });
    
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
