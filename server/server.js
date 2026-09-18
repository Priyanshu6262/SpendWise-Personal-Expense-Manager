// Load environment variables FIRST — before any other require()
// that might initialize modules (like logger.js) which depend on env vars
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const { connectDB }      = require('./models');
const authRoutes          = require('./routes/authRoutes');
const transactionRoutes   = require('./routes/transactionRoutes');
const aiRoutes            = require('./routes/aiRoutes');
const webhookRoutes        = require('./routes/webhookRoutes');

const logger        = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');

// ─── Process-level Error Handlers ────────────────────────────────────────────
// These MUST be registered before anything else starts.
// They ensure that any crash is written to the log file (and therefore to Loki
// via Grafana Alloy) before Node.js exits.

/**
 * Uncaught Exception Handler
 * Fires when synchronous code throws an error that is never caught.
 * e.g.: throw new Error('boom')  outside of any try/catch
 *
 * What we do:
 *  1. Log the full stack trace at error level → goes to error.log → Loki
 *  2. Flush Winston transports (so the log is actually written to disk)
 *  3. Exit with code 1 — PM2 / systemd will restart the process automatically
 */
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION — process will restart', {
    type:    'uncaughtException',
    name:    err.name,
    message: err.message,
    stack:   err.stack,
  });

  // Give Winston up to 3 seconds to flush all transports (file + Loggly) before exit
  setTimeout(() => process.exit(1), 3000);
});

/**
 * Unhandled Promise Rejection Handler
 * Fires when a Promise rejects and no .catch() or try/catch handles it.
 * e.g.: async function that throws without being awaited in a try/catch
 *
 * Node.js 15+ terminates the process on unhandled rejections.
 * We log it explicitly here so Grafana can capture it before exit.
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('UNHANDLED PROMISE REJECTION', {
    type:    'unhandledRejection',
    reason:  reason instanceof Error ? reason.message : String(reason),
    stack:   reason instanceof Error ? reason.stack   : undefined,
    promise: String(promise),
  });

  // Let Node.js default behavior run (it will exit in Node 15+)
  // PM2 / systemd will restart the process automatically
});

// ─── Connect to SQL Database ──────────────────────────────────────────────────
connectDB();

// ─── Express App Setup ───────────────────────────────────────────────────────
const app = express();

// Standard middleware
// ─── CORS ────────────────────────────────────────────────────────────────────
// Allow requests from the Vercel frontend and localhost in development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://spend-wise-personal-expense-manager-three.vercel.app',
  'https://spend-wise-personal-expense-manager.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);
    // Allow any vercel.app preview deployment for this project (spend-wise-* or spendwise-*)
    if (origin.match(/^https:\/\/(spend-wise|spendwise)-personal-expense-manager.*\.vercel\.app$/)) {
      return callback(null, true);
    }
    // Allow any custom CLIENT_URL pattern set via environment variable
    if (process.env.CLIENT_URL && origin.startsWith(process.env.CLIENT_URL)) {
      return callback(null, true);
    }
    if (allowedOrigins.some(o => origin.startsWith(o))) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// HTTP Request Logger — logs every request/response with method, url, status,
// response time, ip, and user-agent.  Must come BEFORE route definitions so that
// all routes are covered.
app.use(requestLogger);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ai',           aiRoutes);

// AI Incident Webhook — receives alerts from Loggly/Datadog and triggers Gemini analysis
app.use('/webhook', webhookRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────
// Frontend is deployed separately on Vercel — this server only serves the API.
// A simple health check endpoint is provided for uptime monitors.
app.get('/', (req, res) => {
  res.json({ status: 'SpendWise API is running ✅', env: process.env.NODE_ENV });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// This middleware catches errors passed via next(err) from any route or middleware.
// It logs the full error (with stack trace) at error level so Grafana Alloy picks
// it up and ships it to Loki under the "spendwise-errors" job.
app.use((err, req, res, next) => {
  logger.error('EXPRESS ERROR HANDLER', {
    type:       'expressError',
    message:    err.message,
    stack:      err.stack,
    method:     req.method,
    url:        req.originalUrl,
    statusCode: err.status || 500,
  });

  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong on the server',
    stack:   process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  // Log startup — visible in Grafana as an application lifecycle event
  logger.info('SERVER STARTED', {
    type:        'lifecycle',
    event:       'startup',
    port:        PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    pid:         process.pid,
  });
});

// ─── Graceful Shutdown Handlers ───────────────────────────────────────────────
// Called when PM2 or systemd sends a SIGTERM (normal shutdown/restart).
// We close existing connections cleanly and log the shutdown event before exiting.
const gracefulShutdown = (signal) => {
  logger.info('SERVER SHUTTING DOWN', {
    type:   'lifecycle',
    event:  'shutdown',
    signal,
    pid:    process.pid,
  });

  server.close(() => {
    logger.info('HTTP server closed. Exiting process.', {
      type:  'lifecycle',
      event: 'exit',
    });
    // Give Winston time to flush log files before the process ends
    setTimeout(() => process.exit(0), 1000);
  });

  // Force-exit if the server hasn't closed within 10 seconds
  // (e.g., there are open keep-alive connections)
  setTimeout(() => {
    logger.error('Graceful shutdown timed out — forcing exit', {
      type: 'lifecycle',
      event: 'forceExit',
    });
    process.exit(1);
  }, 10_000);
};

// SIGTERM is sent by PM2 / systemd / Docker for a normal stop
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// SIGINT is sent when you press Ctrl+C in the terminal
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
