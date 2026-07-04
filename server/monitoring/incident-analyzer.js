/**
 * SpendWise AI Incident Analyzer
 * ─────────────────────────────────────────────────────────────────────────────
 * Standalone Express server that bridges:
 *   Grafana alert webhook → Loki log fetch → Gemini AI analysis → Discord
 *
 * Port  : 5001 (localhost only, never exposed to the internet)
 * Route : POST /webhook  — receives Grafana alert payloads
 *         GET  /health   — health check
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const axios   = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Config ──────────────────────────────────────────────────────────────────

const PORT              = process.env.ANALYZER_PORT || 5001;
const LOKI_URL          = process.env.LOKI_URL      || 'http://127.0.0.1:3100';
const GEMINI_API_KEY    = process.env.GEMINI_API_KEY;
const DISCORD_WEBHOOK   = process.env.DISCORD_WEBHOOK_URL;
const SERVICE_NAME      = 'SpendWise Incident Analyzer';

if (!GEMINI_API_KEY)  console.warn('[IncidentAnalyzer] ⚠️  GEMINI_API_KEY not set — AI analysis disabled');
if (!DISCORD_WEBHOOK) console.warn('[IncidentAnalyzer] ⚠️  DISCORD_WEBHOOK_URL not set — notifications disabled');

// ─── Loki ─────────────────────────────────────────────────────────────────────

/**
 * Fetch recent logs from Loki for incident context.
 * Returns up to `limit` log objects from the last `windowMinutes` minutes.
 */
async function fetchLogsFromLoki(windowMinutes = 15, limit = 30) {
  const nowNs   = BigInt(Date.now()) * 1_000_000n;
  const startNs = nowNs - BigInt(windowMinutes) * 60n * 1_000_000_000n;

  const queries = [
    `{job="spendwise-errors"} | json`,
    `{job="spendwise-app"} | json | statusCode >= 500`,
    `{job="spendwise-app"} | json | level="error"`,
  ];

  const logs = [];

  for (const query of queries) {
    try {
      const { data } = await axios.get(`${LOKI_URL}/loki/api/v1/query_range`, {
        params: {
          query,
          start : startNs.toString(),
          end   : nowNs.toString(),
          limit,
          direction: 'backward',
        },
        timeout: 8000,
      });

      for (const stream of (data?.data?.result ?? [])) {
        for (const [, line] of stream.values) {
          try { logs.push(JSON.parse(line)); }
          catch { logs.push({ raw: line }); }
        }
      }
    } catch (err) {
      console.error(`[IncidentAnalyzer] Loki query failed (${query.slice(0, 40)}…):`, err.message);
    }
  }

  // Deduplicate by message and cap count
  const seen = new Set();
  return logs.filter(log => {
    const key = log.message || log.raw || JSON.stringify(log);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

// ─── Gemini ───────────────────────────────────────────────────────────────────

/**
 * Build a DevOps-focused prompt and call Gemini 1.5 Flash via REST API.
 * Supports all key formats (AIzaSy..., AQ.Ab8..., etc.)
 */
async function analyzeWithGemini(alertName, alertState, labels, logs) {
  if (!GEMINI_API_KEY) return null;

  const logsBlock = logs.length
    ? logs.map((l, i) => `[${i + 1}] ${JSON.stringify(l)}`).join('\n')
    : 'No specific log entries captured in the last 15 minutes.';

  const labelsBlock = Object.entries(labels || {})
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n') || '  (none)';

  const prompt = `You are a senior DevOps/SRE engineer performing real-time incident analysis for **SpendWise**, a production MERN-stack personal expense manager (React + Node.js/Express + MongoDB Atlas) deployed on AWS EC2 Ubuntu.

━━━ INCIDENT CONTEXT ━━━
Alert Name  : ${alertName}
Alert State : ${alertState.toUpperCase()}
Labels      :
${labelsBlock}
Analysis Window : Last 15 minutes

━━━ RECENT ERROR LOGS ━━━
${logsBlock}

━━━ YOUR TASK ━━━
Write a concise, actionable incident report using EXACTLY this structure:

🔍 **ROOT CAUSE**
One or two sentences identifying the most likely root cause based on the logs and alert context.

📊 **IMPACT ASSESSMENT**
- Severity: P1 / P2 / P3 (choose one and justify briefly)
- Affected: which users / API routes / features
- User-facing: yes / no

🚨 **IMMEDIATE ACTIONS** (execute NOW)
1. <specific shell command or UI step>
2. <specific shell command or UI step>
3. <specific shell command or UI step>

🛡️ **PREVENTION**
- <code or config change to prevent recurrence>
- <monitoring or alerting improvement>

Keep the total response under 600 words. Be specific and technical.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

  const response = await axios.post(
    url,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.3 }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      timeout: 15000,
    }
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ? text.trim() : null;
}

// ─── Discord ──────────────────────────────────────────────────────────────────

/** Discord color codes */
const COLORS = {
  firing   : 0xFF4444,  // red
  resolved : 0x00CC66,  // green
  pending  : 0xFFA500,  // orange
};

/**
 * Post a rich embed to Discord with the Gemini incident report.
 */
async function postToDiscord(alertName, alertState, analysis, logsCount, labels) {
  if (!DISCORD_WEBHOOK) return;

  const isResolved = alertState === 'resolved' || alertState === 'ok';
  const emoji      = isResolved ? '✅' : '🚨';
  const color      = COLORS[alertState] ?? COLORS.firing;

  // Discord description limit is 4096 chars
  const description = analysis
    ? (analysis.length > 3800 ? analysis.slice(0, 3800) + '\n\n_…truncated_' : analysis)
    : '⚠️ Gemini analysis unavailable — check GEMINI_API_KEY on the server.';

  const embed = {
    title      : `${emoji} SpendWise Alert — ${alertName}`,
    description,
    color,
    fields     : [
      { name: '📡 Alert State',       value: `\`${alertState.toUpperCase()}\``, inline: true },
      { name: '📝 Logs Analysed',     value: `${logsCount}`,                   inline: true },
      { name: '🕐 Time (UTC)',         value: new Date().toUTCString(),         inline: false },
    ],
    footer     : { text: `${SERVICE_NAME} • Powered by Gemini 1.5 Flash` },
    timestamp  : new Date().toISOString(),
  };

  // Attach top labels as a field if present
  const labelText = Object.entries(labels || {})
    .slice(0, 5)
    .map(([k, v]) => `**${k}**: ${v}`)
    .join('\n');
  if (labelText) embed.fields.push({ name: '🏷️ Labels', value: labelText, inline: false });

  await axios.post(DISCORD_WEBHOOK, {
    username   : 'SpendWise Monitor 🤖',
    avatar_url : 'https://grafana.com/static/assets/img/fav32.png',
    embeds     : [embed],
  }, { timeout: 10000 });
}

// ─── Express app ──────────────────────────────────────────────────────────────

const app = express();
app.use(express.json({ limit: '1mb' }));

/** Health check */
app.get('/health', (_req, res) => {
  res.json({
    status  : 'ok',
    service : SERVICE_NAME,
    gemini  : !!GEMINI_API_KEY,
    discord : !!DISCORD_WEBHOOK,
    loki    : LOKI_URL,
  });
});

/**
 * Grafana Webhook receiver
 * Grafana sends a JSON body — see:
 * https://grafana.com/docs/grafana/latest/alerting/manage-notifications/webhook-notifier/
 */
app.post('/webhook', async (req, res) => {
  const body = req.body;

  // Parse Grafana unified alerting payload
  const alertName  = body.commonLabels?.alertname
                  || body.alerts?.[0]?.labels?.alertname
                  || body.title
                  || 'Unknown Alert';
  const alertState = body.status || 'firing';
  const labels     = body.commonLabels || body.alerts?.[0]?.labels || {};

  console.log(`[IncidentAnalyzer] 🚨 Alert received: "${alertName}" → ${alertState.toUpperCase()}`);

  // Respond immediately so Grafana doesn't time out
  res.status(200).json({ status: 'received', alert: alertName });

  // Run analysis pipeline asynchronously
  (async () => {
    try {
      // 1. Fetch logs
      const logs = await fetchLogsFromLoki(15, 30);
      console.log(`[IncidentAnalyzer] 📋 Fetched ${logs.length} log entries from Loki`);

      // 2. Gemini analysis
      const analysis = await analyzeWithGemini(alertName, alertState, labels, logs);
      if (analysis) {
        console.log('[IncidentAnalyzer] 🤖 Gemini analysis complete');
      } else {
        console.warn('[IncidentAnalyzer] ⚠️  Gemini analysis skipped (no API key)');
      }

      // 3. Discord notification
      await postToDiscord(alertName, alertState, analysis, logs.length, labels);
      console.log('[IncidentAnalyzer] 📣 Discord notification sent');

    } catch (err) {
      console.error('[IncidentAnalyzer] ❌ Pipeline error:', err.message);

      // Best-effort fallback Discord message
      if (DISCORD_WEBHOOK) {
        try {
          await axios.post(DISCORD_WEBHOOK, {
            username : 'SpendWise Monitor 🤖',
            content  : `🚨 **${alertName}** alert fired but the AI analysis pipeline failed:\n\`\`\`${err.message}\`\`\``,
          });
        } catch { /* swallow */ }
      }
    }
  })();
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║  ${SERVICE_NAME}           ║`);
  console.log(`║  Listening on http://127.0.0.1:${PORT}             ║`);
  console.log(`║  Gemini  : ${GEMINI_API_KEY  ? '✅ configured' : '❌ missing GEMINI_API_KEY '}  ║`);
  console.log(`║  Discord : ${DISCORD_WEBHOOK ? '✅ configured' : '❌ missing DISCORD_WEBHOOK_URL'}  ║`);
  console.log(`╚══════════════════════════════════════════════════╝\n`);
});
