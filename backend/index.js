const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/features/auth/auth.routes');
const adminRoutes = require('./src/features/admin/admin.routes');
const seedRoutes = require('./src/features/seed/seed.routes');
const { emailRoutes } = require('./src/features/email');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.APP_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

// Feature routes
app.use('/api/auth', authRoutes);
app.use('/api/me', (req, res, next) => {
  req.url = '/me';
  authRoutes(req, res, next);
});
app.use('/api/admin', adminRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/email', emailRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ExamSlot Academic Backend API',
    timestamp: new Date().toISOString(),
  });
});

// MongoDB connection
const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI;
if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));
} else {
  console.warn('Warning: No DATABASE_URL or MONGODB_URI defined in environment.');
}

app.listen(port, () => {
  console.log(`🚀 ExamSlot Backend server running on port ${port}`);
});
