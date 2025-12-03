const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file in backend directory
const envPath = path.join(__dirname, '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('⚠️  .env file not found or has errors. Using defaults or environment variables.');
} else {
  console.log('✅ Environment variables loaded from .env file');
}

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/kx', require('./routes/kx'));
app.use('/api/messages', require('./routes/messages'));
<<<<<<< HEAD
=======
app.use('/api/files', require('./routes/files'));
>>>>>>> 44486ae (Full Deployment)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/secure_messaging';

if (!process.env.MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI not found in .env file, using default: mongodb://localhost:27017/secure_messaging');
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Explicitly select database name when using MongoDB Atlas connection string
  dbName: 'infoProject'
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  console.error('💡 Make sure MongoDB is running or check your MONGODB_URI in .env file');
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

