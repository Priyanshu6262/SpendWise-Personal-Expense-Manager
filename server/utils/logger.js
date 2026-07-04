const winston = require('winston');
const { Loggly } = require('winston-loggly-bulk');
const path = require('path');
const fs = require('fs');

// ─── Determine environment ────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';

// ─── Log Directory Setup ──────────────────────────────────────────────────────
// In production on Linux/EC2, write logs to /var/log/spendwise/
// In development (Windows/local), fall back to a local logs/ folder inside the project
const LOG_DIR = isProduction
  ? '/var/log/spendwise'
  : path.join(__dirname, '../../logs');

// Attempt to create the log directory if it does not exist yet.
// On EC2 the directory should already exist (created by the setup script with
// correct ownership). This block only matters for local dev.
if (!fs.existsSync(LOG_DIR)) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch (err) {
    // Gracefully degrade — if we cannot create the folder, log to console only.
    console.warn(`[Logger] Could not create log directory at ${LOG_DIR}:`, err.message);
  }
}

// ─── Log File Paths ───────────────────────────────────────────────────────────
// app.log   → all log levels (info, warn, error, debug)
//             Grafana Alloy reads this file and ships entries to Loki with
//             the label job="spendwise-app"
//
// error.log → error-level only
//             Alloy ships these with label job="spendwise-errors"
//             Useful for alert rules that should only fire on real errors.
const APP_LOG_FILE   = path.join(LOG_DIR, 'app.log');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'error.log');

// ─── Shared JSON Format for File Transports ───────────────────────────────────
// Every line written to the log files is a single-line JSON object.
// Alloy's json parsing stage will extract `level`, `message`, `timestamp`, etc.
// as Loki stream labels / structured metadata.
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }), // ISO 8601 with ms
  winston.format.errors({ stack: true }),   // serialize Error objects with full stack trace
  winston.format.json()                     // output as a single JSON line
);

// ─── Console Format ───────────────────────────────────────────────────────────
// Colorized, human-readable output for local development.
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} [${level}]: ${message}\n${stack}`
      : `${timestamp} [${level}]: ${message}`;
  })
);

// ─── Build Transports Array ───────────────────────────────────────────────────
const transports = [
  // 1. Console transport — always active
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// 2. File transports — only added when the log directory is available and writable.
const canWriteToFile = fs.existsSync(LOG_DIR);
if (canWriteToFile) {
  transports.push(
    // app.log: captures all log levels (info, warn, error, debug)
    new winston.transports.File({
      filename: APP_LOG_FILE,
      format: jsonFormat,
      maxsize: 10 * 1024 * 1024, // rotate after 10 MB
      maxFiles: 5,               // keep at most 5 rotated files on disk
      tailable: true,            // always write to the newest file (important for Alloy tail mode)
    }),

    // error.log: captures ONLY error-level logs
    new winston.transports.File({
      filename: ERROR_LOG_FILE,
      level: 'error',
      format: jsonFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    })
  );
} else {
  console.warn('[Logger] File transports disabled — log directory not accessible.');
}

// ─── Create the Logger ────────────────────────────────────────────────────────
const logger = winston.createLogger({
  // Minimum log level: debug in dev, info in production
  level: isProduction ? 'info' : 'debug',

  // defaultMeta is merged into every log entry.
  // Grafana Loki will index these as structured metadata fields.
  defaultMeta: {
    service: 'spendwise-api',
    environment: process.env.NODE_ENV || 'development',
  },

  transports,

  // Do NOT let Winston call process.exit() on uncaught exceptions —
  // we handle those ourselves in server.js.
  exitOnError: false,
});

// ─── Optional: Loggly Transport (backward-compatible) ────────────────────────
// Kept exactly as before — Loggly and Grafana/Loki work in parallel.
// Remove this block only if you have fully migrated away from Loggly.
if (process.env.LOGGLY_TOKEN && process.env.LOGGLY_SUBDOMAIN) {
  console.log('[Logger] Initializing Loggly transport for subdomain:', process.env.LOGGLY_SUBDOMAIN);
  logger.add(new Loggly({
    token: process.env.LOGGLY_TOKEN,
    subdomain: process.env.LOGGLY_SUBDOMAIN,
    tags: ['spendwise-api', isProduction ? 'production' : 'development'],
    json: true,
  }));
} else {
  console.log('[Logger] Loggly transport NOT added — LOGGLY_TOKEN or LOGGLY_SUBDOMAIN missing.');
}

// ─── Export ───────────────────────────────────────────────────────────────────
module.exports = logger;
