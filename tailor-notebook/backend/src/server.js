const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { pool } = require('./config/database');
const { authenticate } = require('./middleware/authMiddleware');
const { requireRole } = require('./middleware/roleMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { startReminderJob } = require('./services/notificationService');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.frontendUrl.split(',').map((s) => s.trim()),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  exposedHeaders: ['Content-Disposition'],
}));
app.use(express.json({ limit: '100kb' }));
if (env.nodeEnv !== 'test') app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/api/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ success: true, message: 'OK' }); }
  catch { res.status(503).json({ success: false, message: 'Database unavailable' }); }
});

app.use('/api/auth', require('./routes/authRoutes'));

// Everything below requires a logged-in user
app.use('/api', authenticate);
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api', require('./routes/measurementRoutes'));
app.use('/api', require('./routes/orderRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/pdf', require('./routes/pdfRoutes'));
app.use('/api/backups', requireRole('admin'), require('./routes/backupRoutes'));

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(env.port, () => {
    logger.info(`Tailor Notebook API listening on http://localhost:${env.port}`);
    startReminderJob();
  });
}

module.exports = app;
