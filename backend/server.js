'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const analyticsRoutes = require('./src/routes/analytics');
const customersRoutes = require('./src/routes/customers');
const productsRoutes = require('./src/routes/products');
const campaignsRoutes = require('./src/routes/campaigns');
const aiRoutes = require('./src/routes/ai');
const actionsRoutes = require('./src/routes/actions');
const notificationsRoutes = require('./src/routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware — allow Vercel frontend + localhost in dev
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Paytm GrowthPilot API',
    mode: process.env.GEMINI_API_KEY ? 'gemini' : 'demo',
    timestamp: new Date().toISOString() 
  });
});

// API Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Merchant info
app.get('/api/merchant', (_req, res) => {
  const { merchant } = require('./src/data/seedData');
  res.json({ success: true, data: merchant });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🚀 Paytm GrowthPilot API Server          ║
║   Port: ${PORT}                              ║
║   Mode: ${process.env.GEMINI_API_KEY ? 'Gemini AI' : 'Demo AI'} (deterministic)     ║
║   Merchant: Rajesh Family Restaurant        ║
╚════════════════════════════════════════════╝
`);
});

module.exports = app;
