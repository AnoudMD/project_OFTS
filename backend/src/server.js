/**
 * OFTS Backend — Entry point
 *
 * Loads environment variables from backend/.env, connects to MongoDB,
 * then starts the Express HTTP server.
 *
 * Environment variables (see .env.example):
 *   MONGO_URI      — MongoDB connection string
 *   JWT_SECRET     — Secret for signing JWTs
 *   PORT           — HTTP port (default 5000)
 *   CLIENT_ORIGIN  — CORS allowed origin
 *   UPLOAD_DIR     — Directory for uploaded files (default "uploads")
 */

require('dotenv').config();   // reads backend/.env automatically

const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');

const connectDB      = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes          = require('./routes/auth.routes');
const batchRoutes         = require('./routes/batch.routes');
const eventRoutes         = require('./routes/event.routes');
const certificationRoutes = require('./routes/certification.routes');
const scanRoutes          = require('./routes/scan.routes');
const uploadRoutes        = require('./routes/upload.routes');

// ── App setup ─────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP request logger (dev only) ────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Static: serve uploaded certification documents ────────────────────────────
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadDir));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/api/batches',        batchRoutes);
app.use('/api/events',         eventRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/scans',          scanRoutes);
app.use('/api/uploads',        uploadRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    service: 'OFTS Backend API',
    database: dbState[require('mongoose').connection.readyState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ── Boot: connect DB then listen ──────────────────────────────────────────────
async function start() {
  await connectDB();   // graceful — server starts even if DB is down

  app.listen(PORT, () => {
    console.log(`\n[SERVER] OFTS API running on http://localhost:${PORT}`);
    console.log(`[SERVER] Health:    http://localhost:${PORT}/api/health`);
    console.log(`[SERVER] Auth:      POST http://localhost:${PORT}/api/auth/login`);
    console.log(`[SERVER] Batches:   GET  http://localhost:${PORT}/api/batches\n`);
  });
}

start();

module.exports = app;  // allows import in tests
