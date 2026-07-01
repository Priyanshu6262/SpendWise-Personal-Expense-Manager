const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('./logger');

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model priority list — tries each in order until one succeeds on quota/availability
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro'];

/**
 * Analyzes an incident log using Google Gemini AI.
 * @param {Object} logData - The log/alert payload received from the monitoring platform.
 * @returns {Promise<Object>} - Structured analysis: { summary, rootCause, steps, severity }
 */
async function analyzeIncident(logData) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables.');
  }

  // Build the prompt first so it can be passed to whichever model works
  const prompt = `
You are an expert backend engineer and incident responder.
A production error has been detected in a MERN stack web application called **SpendWise** (a Personal Expense Manager).

## Error Log Data
\`\`\`json
${JSON.stringify(logData, null, 2)}
\`\`\`

## Your Task
Analyze this error and respond in the following **strict JSON format only** (no extra text, no markdown fences):
{
  "severity": "Critical | High | Medium | Low",
  "summary": "One sentence describing the error.",
  "rootCause": "2-3 sentences explaining the most likely root cause based on the stack trace and context.",
  "immediateSteps": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "preventionTips": [
    "Tip 1: ...",
    "Tip 2: ..."
  ],
  "estimatedImpact": "Brief description of who/what is affected."
}

Be specific to the SpendWise MERN stack context (Node.js/Express backend, MongoDB/Mongoose, React frontend).
`.trim();

  // Try models in priority order — falls through on quota/404 errors
  let result = null;
  let lastError = null;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      logger.info(`[GeminiAnalyzer] Trying model: ${modelName}`);
      result = await model.generateContent(prompt);
      logger.info(`[GeminiAnalyzer] Success with model: ${modelName}`);
      break;
    } catch (err) {
      lastError = err;
      logger.warn(`[GeminiAnalyzer] Model ${modelName} unavailable: ${err.message.slice(0, 120)}`);
    }
  }

  if (!result) {
    logger.error('[GeminiAnalyzer] All models failed. Last error: ' + (lastError?.message || 'unknown'));
    throw lastError || new Error('All Gemini models failed.');
  }

  try {
    const responseText = result.response.text().trim();

    // Strip markdown code fences if Gemini wraps the JSON
    const cleaned = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const analysis = JSON.parse(cleaned);
    logger.info('[GeminiAnalyzer] Analysis complete. Severity: ' + analysis.severity);
    return analysis;
  } catch (err) {
    logger.error('[GeminiAnalyzer] Failed to parse Gemini response: ' + err.message);
    return {
      severity: 'Unknown',
      summary: 'Gemini returned an unparseable response — manual review required.',
      rootCause: err.message.slice(0, 500),
      immediateSteps: ['Check the server logs manually.', 'Review the error stack trace.'],
      preventionTips: ['Ensure GEMINI_API_KEY is valid and has quota.'],
      estimatedImpact: 'Unknown — Gemini could not process the log.',
    };
  }
}

module.exports = { analyzeIncident };
