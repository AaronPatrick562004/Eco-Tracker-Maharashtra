// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ✅ FIX: import middleware correctly
const authenticate = require('./src/middleware/auth');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const schoolPortalRoutes = require('./src/routes/schoolPortalRoutes');
const activityLoggerRoutes = require('./src/routes/activityLoggerRoutes');
const monitorRoutes = require('./src/routes/monitorRoutes');
const recognitionRoutes = require('./src/routes/recognitionRoutes');
const ecoPassportsRoutes = require('./src/routes/ecoPassportsRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const communityRoutes = require('./src/routes/communityRoutes');
const resolutionsRoutes = require('./src/routes/resolutionsRoutes');

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/school-portal', authenticate, schoolPortalRoutes);
app.use('/api/activity-logger', authenticate, activityLoggerRoutes);
app.use('/api/monitor', authenticate, monitorRoutes);
app.use('/api/recognition', authenticate, recognitionRoutes);
app.use('/api/eco-passports', authenticate, ecoPassportsRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);
app.use('/api/community', authenticate, communityRoutes);
app.use('/api/resolutions', authenticate, resolutionsRoutes);

// Health
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date()
  });
});

// Root
app.get('/', (req, res) => {
  res.json({ message: 'EcoTrack Backend API' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});