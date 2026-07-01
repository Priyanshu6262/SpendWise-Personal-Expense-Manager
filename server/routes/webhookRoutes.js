const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { analyzeIncident } = require('../utils/geminiAnalyzer');
const { sendDiscordAlert } = require('../utils/discordNotifier');

/**
 * POST /webhook/incident
 *
 * Receives an alert payload from a monitoring platform (Loggly, Datadog, etc.)
 * or any HTTP client (curl, ngrok test, etc.).
 *
 * Expected payload shape (all fields optional — we'll use whatever is provided):
 * {
 *   "level":      "error",
 *   "message":    "TypeError: Cannot read properties of undefined",
 *   "stack":      "Error: ...\n    at ...",
 *   "statusCode": 500,
 *   "timestamp":  "2026-07-02T00:00:00Z",
 *   "tags":       ["production"],
 *   "source":     "loggly"    // or "datadog", "manual", etc.
 * }
 *
 * Loggly also wraps the payload under a `logmessages` array — we handle that too.
 */
router.post('/incident', async (req, res) => {
  // Acknowledge the webhook IMMEDIATELY (< 2s) so Loggly doesn't retry
  res.status(200).json({ received: true, message: 'Incident queued for AI analysis.' });

  // --- Extract the actual log data (handle Loggly's wrapper format) ---
  let logData = req.body;

  // Loggly wraps webhook payloads: { logmessages: [ { ... } ] }
  if (logData.logmessages && Array.isArray(logData.logmessages)) {
    logData = logData.logmessages[0] || logData;
  }

  logger.info('[Webhook] Incident received. Starting AI analysis pipeline...');
  logger.info('[Webhook] Payload: ' + JSON.stringify(logData));

  // --- Run analysis pipeline asynchronously (after response is sent) ---
  try {
    // Step 1: Analyze with Gemini
    const analysis = await analyzeIncident(logData);

    // Step 2: Send to Discord
    await sendDiscordAlert(analysis, logData);

    logger.info('[Webhook] AI pipeline complete. Discord notification sent.');
  } catch (err) {
    logger.error('[Webhook] AI pipeline error: ' + err.message);
    // Error is logged — the 200 was already sent so Loggly won't retry
  }
});

/**
 * GET /webhook/test
 * A quick browser-accessible endpoint to fire a fake incident for testing.
 */
router.get('/test', async (req, res) => {
  const fakeLog = {
    level: 'error',
    message: "TypeError: Cannot read properties of undefined (reading 'userId')",
    stack:
      "TypeError: Cannot read properties of undefined (reading 'userId')\n" +
      '    at getTransactions (controllers/transactionController.js:45:22)\n' +
      '    at Layer.handle [as handle_request] (node_modules/express/lib/router/layer.js:95:5)',
    statusCode: 500,
    timestamp: new Date().toISOString(),
    tags: ['production', 'mern-expense-manager'],
    source: 'manual-test',
  };

  res.status(200).json({
    message: 'Test incident fired! Check your Discord channel in ~5 seconds.',
    payload: fakeLog,
  });

  logger.info('[Webhook /test] Firing test incident through AI pipeline...');

  try {
    const analysis = await analyzeIncident(fakeLog);
    await sendDiscordAlert(analysis, fakeLog);
    logger.info('[Webhook /test] Test pipeline complete.');
  } catch (err) {
    logger.error('[Webhook /test] Test pipeline error: ' + err.message);
  }
});

module.exports = router;
