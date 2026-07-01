// Load environment variables FIRST — before any other require()
// that might initialize modules (like logger.js) which depend on env vars
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const logger = require('./utils/logger');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// AI Incident Webhook — receives alerts from Loggly/Datadog and triggers Gemini analysis
app.use('/webhook', webhookRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
} else {
  // Root Endpoint for API status checking
  app.get('/', (req, res) => {
    res.json({ status: 'API is running successfully...' });
  });
}

// Error handling middleware (fallback)
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  res.status(500).json({
    message: err.message || 'Something went wrong on the server',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
