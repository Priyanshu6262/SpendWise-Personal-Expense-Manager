const logger = require('../utils/logger');

/**
 * HTTP Request Logger Middleware
 *
 * Logs every incoming request and its corresponding response with:
 *   - HTTP method (GET, POST, etc.)
 *   - URL path
 *   - Response status code
 *   - Response time in milliseconds
 *   - Client IP address
 *   - User-Agent header
 *
 * Log levels are chosen automatically based on the status code:
 *   - 2xx / 3xx  → info
 *   - 4xx        → warn   (client errors — login failures, not-found, etc.)
 *   - 5xx        → error  (server errors — triggers Grafana alerts)
 *
 * Because all logs are written as JSON via Winston, Grafana Alloy can extract
 * the `statusCode`, `method`, `url`, and `responseTimeMs` fields as structured
 * metadata in Loki, enabling powerful LogQL metric queries.
 *
 * Usage (in server.js):
 *   const requestLogger = require('./middleware/requestLogger');
 *   app.use(requestLogger);
 */
const requestLogger = (req, res, next) => {
  // Record the exact moment the request arrived
  const startTime = process.hrtime.bigint();

  // Wait until the response is fully sent before logging, so we have the status code
  res.on('finish', () => {
    // Calculate elapsed time in milliseconds (hrtime gives nanoseconds)
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;

    const statusCode = res.statusCode;
    const method     = req.method;
    const url        = req.originalUrl || req.url;

    // Extract the real client IP — works behind Nginx reverse proxy
    const ip = req.headers['x-forwarded-for']
      ? req.headers['x-forwarded-for'].split(',')[0].trim()
      : req.socket?.remoteAddress || 'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';

    // Build the structured log payload
    // All fields here become queryable in Grafana via LogQL | json | field="value"
    const logData = {
      type:           'http_request',      // makes it easy to filter in LogQL
      method,
      url,
      statusCode,
      responseTimeMs: parseFloat(durationMs.toFixed(2)),
      ip,
      userAgent,
    };

    // Choose the appropriate log level based on HTTP status code
    if (statusCode >= 500) {
      // Server-side errors — these will trigger Grafana alerts
      logger.error(`${method} ${url} ${statusCode} ${durationMs.toFixed(0)}ms`, logData);
    } else if (statusCode >= 400) {
      // Client-side errors — worth tracking but not an emergency
      logger.warn(`${method} ${url} ${statusCode} ${durationMs.toFixed(0)}ms`, logData);
    } else {
      // Successful responses
      logger.info(`${method} ${url} ${statusCode} ${durationMs.toFixed(0)}ms`, logData);
    }
  });

  next();
};

module.exports = requestLogger;
