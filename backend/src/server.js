const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { initDatabase } = require('./config/database');
const logger = require('./utils/logger');

const app = express();

// Security & Parsing Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ONLINE',
    service: 'Tailor Notebook REST API',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));

// Orders
app.use('/api/customer/orders', require('./routes/orderRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Measurements
app.use('/api/customer/measurements', require('./routes/measurementRoutes'));
app.use('/api/measurements', require('./routes/measurementRoutes'));

// Payments
app.use('/api/customer/payments', require('./routes/paymentRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Notifications
app.use('/api/customer/notifications', require('./routes/notificationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Customer
app.use('/api/customer', require('./routes/customerRoutes'));

// Tracking & Contact
app.use('/api/tracking', require('./routes/trackingRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

// Admin Routes
app.use('/api/admin/orders', require('./routes/orderRoutes'));
app.use('/api/admin/payments', require('./routes/paymentRoutes'));
app.use('/api/admin/customers', require('./routes/customerRoutes'));
app.use('/api/admin/services', require('./routes/serviceRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route '${req.method} ${req.originalUrl}' not found.`
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled API Error:', err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.'
  });
});

async function startServer() {
  await initDatabase();
  app.listen(env.port, () => {
    logger.info(`✨ Tailor Notebook API running on http://localhost:${env.port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
