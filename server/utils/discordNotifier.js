const https = require('https');
const http = require('http');
const { URL } = require('url');
const logger = require('./logger');

// Severity → Discord embed color (decimal)
const SEVERITY_COLORS = {
  Critical: 15158332, // Red
  High: 15105570,     // Orange
  Medium: 16776960,   // Yellow
  Low: 3447003,       // Blue
  Unknown: 9807270,   // Grey
};

// Severity → emoji
const SEVERITY_EMOJI = {
  Critical: '🔴',
  High: '🟠',
  Medium: '🟡',
  Low: '🟢',
  Unknown: '⚪',
};

/**
 * Sends a formatted Discord embed with the Gemini incident analysis.
 * @param {Object} analysis - The structured analysis returned by geminiAnalyzer.
 * @param {Object} originalLog - The raw log payload received from the webhook.
 * @returns {Promise<void>}
 */
// Discord limits: title ≤ 256, description ≤ 4096, field value ≤ 1024
function trunc(str, max = 1024) {
  if (!str) return 'N/A';
  const s = String(str);
  return s.length <= max ? s : s.slice(0, max - 3) + '...';
}

async function sendDiscordAlert(analysis, originalLog) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    logger.warn('[DiscordNotifier] DISCORD_WEBHOOK_URL is not set. Skipping Discord notification.');
    return;
  }

  const severity = analysis.severity || 'Unknown';
  const color = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.Unknown;
  const emoji = SEVERITY_EMOJI[severity] ?? '⚪';

  // Format the immediate steps as a numbered list
  const stepsList = (analysis.immediateSteps || [])
    .map((step, i) => `**${i + 1}.** ${step}`)
    .join('\n');

  // Format the prevention tips
  const tipsList = (analysis.preventionTips || [])
    .map((tip) => `• ${tip}`)
    .join('\n');

  const timestamp = new Date().toISOString();

  const rawError = originalLog.message || JSON.stringify(originalLog);
  const errorSnippet = rawError.substring(0, 800);

  const payload = {
    username: 'SpendWise Incident Bot',
    avatar_url: 'https://cdn-icons-png.flaticon.com/512/1532/1532556.png',
    embeds: [
      {
        title: trunc(`${emoji} Incident Detected — ${severity} Severity`, 256),
        description: trunc(`**${analysis.summary || 'An error occurred in production.'}**`, 4096),
        color,
        fields: [
          {
            name: '🔍 Root Cause',
            value: trunc(analysis.rootCause || 'Could not determine root cause.'),
            inline: false,
          },
          {
            name: '📋 Immediate Steps',
            value: trunc(stepsList || 'No steps available.'),
            inline: false,
          },
          {
            name: '🛡️ Prevention Tips',
            value: trunc(tipsList || 'No tips available.'),
            inline: false,
          },
          {
            name: '💥 Estimated Impact',
            value: trunc(analysis.estimatedImpact || 'Unknown impact.'),
            inline: false,
          },
          {
            name: '📄 Original Error',
            value: trunc(`\`\`\`\n${errorSnippet}\`\`\``),
            inline: false,
          },
        ],
        footer: {
          text: 'SpendWise AI Incident Responder • Powered by Google Gemini',
          icon_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/120px-Google_Gemini_logo.svg.png',
        },
        timestamp,
      },
    ],
  };

  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const parsedUrl = new URL(webhookUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const transport = isHttps ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = transport.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          logger.info('[DiscordNotifier] Alert sent to Discord successfully.');
          resolve();
        } else {
          logger.error(`[DiscordNotifier] Discord returned status ${res.statusCode}: ${data}`);
          reject(new Error(`Discord responded with ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      logger.error('[DiscordNotifier] Request failed: ' + err.message);
      reject(err);
    });

    req.write(body);
    req.end();
  });
}

module.exports = { sendDiscordAlert };
