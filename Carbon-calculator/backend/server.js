require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:3001',
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
  res.json({ message: 'Server is running!' });
});


app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// app.use((err, req, res, next) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({ error: 'Internal server error' });
// });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


