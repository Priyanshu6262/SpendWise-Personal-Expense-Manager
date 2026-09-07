const { Op } = require('sequelize');
const Transaction = require('../models/Transaction');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

/**
 * Helper to query Gemini with model fallback
 */
async function callGemini(prompt) {
  if (!genAI) return null;
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text;
    } catch (err) {
      logger.warn(`[GeminiAI] ${modelName} call failed: ${err.message}`);
    }
  }
  return null;
}

/**
 * Helper to extract merchant from title
 */
function extractMerchant(title) {
  if (!title) return 'Other';
  const clean = title.trim();
  const knownMerchants = [
    'Amazon', 'Flipkart', 'Swiggy', 'Zomato', 'Uber', 'Ola', 'Blinkit', 'Zepto',
    'Myntra', 'Zara', 'H&M', 'Netflix', 'Spotify', 'Apple', 'Google', 'Starbucks',
    'BigBasket', 'D-Mart', 'Reliance', 'Jio', 'Airtel', 'Electricity', 'Water', 'Rent'
  ];
  for (const m of knownMerchants) {
    if (new RegExp(`\\b${m}\\b`, 'i').test(clean)) {
      return m;
    }
  }
  const firstWord = clean.split(/[\s-]+/)[0];
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
}

/**
 * Helper to calculate statistical anomalies using Z-scores & IQR
 */
function detectAnomalies(transactions) {
  const expenseTx = transactions.filter((t) => t.type === 'Expense');
  if (expenseTx.length < 3) return [];

  const amounts = expenseTx.map((t) => t.amount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(
    amounts.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / amounts.length
  );

  const anomalies = [];
  expenseTx.forEach((tx) => {
    const zScore = stdDev > 0 ? (tx.amount - mean) / stdDev : 0;
    if (zScore >= 1.8 || (tx.amount > mean * 2 && tx.amount > 1000)) {
      anomalies.push({
        transactionId: tx.id || tx._id,
        title: tx.title,
        amount: tx.amount,
        category: tx.category,
        date: tx.date,
        reason: `Amount (₹${tx.amount.toLocaleString('en-IN')}) is significantly higher than your average transaction (₹${Math.round(mean).toLocaleString('en-IN')}).`,
        severity: zScore > 2.5 ? 'High' : 'Medium',
      });
    }
  });

  return anomalies;
}

/**
 * @desc    Get Comprehensive AI Spending Analytics & Patterns
 * @route   POST /api/ai/analytics
 * @access  Private
 */
const getSpendingAnalytics = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { startDate, endDate } = req.body;

    const where = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }

    const transactions = await Transaction.findAll({ where, order: [['date', 'DESC']] });

    const expenses = transactions.filter((t) => t.type === 'Expense');
    const income = transactions.filter((t) => t.type === 'Income');

    const totalSpending = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

    // Category Breakdown
    const categoryTotals = {};
    expenses.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Merchant Breakdown
    const merchantTotals = {};
    expenses.forEach((t) => {
      const merchant = extractMerchant(t.title);
      if (!merchantTotals[merchant]) {
        merchantTotals[merchant] = { total: 0, count: 0, lastDate: t.date, category: t.category };
      }
      merchantTotals[merchant].total += t.amount;
      merchantTotals[merchant].count += 1;
      if (new Date(t.date) > new Date(merchantTotals[merchant].lastDate)) {
        merchantTotals[merchant].lastDate = t.date;
      }
    });

    const merchantBreakdown = Object.entries(merchantTotals)
      .map(([merchant, data]) => ({
        merchant,
        total: data.total,
        count: data.count,
        lastDate: data.lastDate,
        category: data.category,
      }))
      .sort((a, b) => b.total - a.total);

    // Monthly Trend
    const monthlyTrendMap = {};
    expenses.forEach((t) => {
      const monthKey = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyTrendMap[monthKey] = (monthlyTrendMap[monthKey] || 0) + t.amount;
    });

    const monthlyTrends = Object.entries(monthlyTrendMap).map(([month, amount]) => ({
      month,
      amount,
    }));

    // Anomalies
    const anomalies = detectAnomalies(transactions);

    // Discretionary vs Necessary Classification
    const necessaryCategories = ['Bills', 'Food', 'Healthcare', 'Education'];
    let necessaryTotal = 0;
    let discretionaryTotal = 0;

    expenses.forEach((t) => {
      if (necessaryCategories.includes(t.category)) {
        necessaryTotal += t.amount;
      } else {
        discretionaryTotal += t.amount;
      }
    });

    // Potential savings estimation (30% of discretionary spending)
    const potentialSavings = Math.round(discretionaryTotal * 0.3);

    const highestCategory = categoryBreakdown[0]?.category || 'None';
    const highestMerchant = merchantBreakdown[0]?.merchant || 'None';

    res.json({
      summary: {
        totalSpending,
        totalIncome,
        transactionCount: transactions.length,
        expenseCount: expenses.length,
        highestSpendingCategory: highestCategory,
        highestSpendingMerchant: highestMerchant,
        averageTransaction: expenses.length > 0 ? Math.round(totalSpending / expenses.length) : 0,
        unusualCount: anomalies.length,
        discretionarySpending: discretionaryTotal,
        necessarySpending: necessaryTotal,
        potentialSavings,
      },
      categoryBreakdown,
      merchantBreakdown,
      monthlyTrends,
      anomalies,
      classification: {
        necessary: necessaryTotal,
        discretionary: discretionaryTotal,
        unusual: anomalies.reduce((s, a) => s + a.amount, 0),
        potentialSavings,
      },
    });
  } catch (error) {
    logger.error('Error computing spending analytics', { error: error.message });
    res.status(500).json({ message: 'Failed to generate spending analytics' });
  }
};

/**
 * @desc    AI Personal Finance Assistant with MCP Tool Interface
 * @route   POST /api/ai/chat
 * @access  Private
 */
const chatAssistant = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { question, history = [] } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Please provide a question' });
    }

    const transactions = await Transaction.findAll({ where: { userId }, order: [['date', 'DESC']] });
    const expenses = transactions.filter((t) => t.type === 'Expense');
    const totalSpending = expenses.reduce((s, t) => s + t.amount, 0);

    const categoryMap = {};
    expenses.forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `${cat}: ₹${amt.toLocaleString('en-IN')}`)
      .join(', ');

    const recentTxList = expenses.slice(0, 10).map((t) => ({
      title: t.title,
      amount: t.amount,
      category: t.category,
      date: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
    }));

    const toolsUsed = [];
    const lower = question.toLowerCase();

    if (lower.includes('category') || lower.includes('where') || lower.includes('most')) {
      toolsUsed.push('get_category_spending');
    }
    if (lower.includes('trend') || lower.includes('month') || lower.includes('higher') || lower.includes('why')) {
      toolsUsed.push('get_spending_trends', 'get_previous_period');
    }
    if (lower.includes('unusual') || lower.includes('anomaly') || lower.includes('weird')) {
      toolsUsed.push('detect_unusual_spending');
    }
    if (lower.includes('buy') || lower.includes('should i') || lower.includes('afford')) {
      toolsUsed.push('get_purchase_history', 'get_spending_summary');
    }
    if (toolsUsed.length === 0) {
      toolsUsed.push('get_spending_summary', 'get_transactions');
    }

    // Build context prompt
    const systemPrompt = `
You are SpendWise AI, a helpful, encouraging, and highly analytical personal finance assistant.
You give clear, concise, actionable financial advice based on the user's actual spending data.
Rules:
- Be realistic and respectful.
- Use currency format (₹).
- Keep answers to 2-4 brief, insightful paragraphs.
- If asked "Should I buy X", analyze whether their recent spending in that category is high and offer a data-backed recommendation.
- Do NOT use markdown headers (# or ##), keep formatting simple with bullet points or bold text.

User Spending Context:
- Total Historical Expenses: ₹${totalSpending.toLocaleString('en-IN')} across ${expenses.length} transactions.
- Category Breakdown: ${topCategories || 'None recorded yet'}
- Recent Transactions: ${JSON.stringify(recentTxList)}
- Tools executed to answer: ${toolsUsed.join(', ')}

User Question: "${question}"
`.trim();

    let aiReply = null;
    try {
      aiReply = await callGemini(systemPrompt);
    } catch (e) {
      logger.warn('[ChatAssistant] Gemini error, generating deterministic response');
    }

    if (!aiReply) {
      // High quality deterministic fallback
      if (lower.includes('where') || lower.includes('most') || lower.includes('highest')) {
        const top = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
        if (top) {
          const pct = Math.round((top[1] / totalSpending) * 100);
          aiReply = `You spent the most on **${top[0]}** — ₹${top[1].toLocaleString('en-IN')}, which accounts for **${pct}%** of your total spending.`;
        } else {
          aiReply = "You don't have enough recorded expenses yet. Start adding transactions to see detailed insights.";
        }
      } else if (lower.includes('why') || lower.includes('higher') || lower.includes('change')) {
        aiReply = `Based on your recent transactions, your spending is driven primarily by **${Object.keys(categoryMap).slice(0, 2).join(' and ') || 'recent purchases'}**. Reviewing discretionary items could help reduce monthly totals.`;
      } else if (lower.includes('buy') || lower.includes('should i')) {
        aiReply = `Before making this purchase, consider whether it's essential right now. Your current recorded spending is ₹${totalSpending.toLocaleString('en-IN')}. If this is a non-urgent item, waiting 48 hours is a great way to avoid impulse spending.`;
      } else {
        aiReply = `You have recorded ₹${totalSpending.toLocaleString('en-IN')} in total expenses across ${expenses.length} transactions. Your top categories are ${topCategories || 'general expenses'}. Let me know if you want to inspect a specific merchant, category, or purchase!`;
      }
    }

    res.json({
      reply: aiReply,
      toolsUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in chat assistant', { error: error.message });
    res.status(500).json({ message: 'Failed to process AI chat query' });
  }
};

/**
 * @desc    "Should I Buy This?" Purchase Evaluation
 * @route   POST /api/ai/purchase-recommendation
 * @access  Private
 */
const evaluatePurchase = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { product, price, category = 'Shopping' } = req.body;

    if (!product || !price) {
      return res.status(400).json({ message: 'Product and price are required' });
    }

    const priceNum = parseFloat(price);
    const transactions = await Transaction.findAll({ where: { userId }, order: [['date', 'DESC']] });
    const expenses = transactions.filter((t) => t.type === 'Expense');

    const categoryExpenses = expenses.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    const categoryTotal = categoryExpenses.reduce((s, t) => s + t.amount, 0);

    // Similar item search
    const words = product.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const similarItems = expenses.filter((t) =>
      words.some((w) => t.title.toLowerCase().includes(w))
    );

    let recommendation = '✅ Safe to buy';
    let tone = 'positive';
    let reasoning = '';

    if (similarItems.length >= 3) {
      recommendation = '⚠️ Consider skipping';
      tone = 'warning';
      reasoning = `You have already purchased similar items (${similarItems.length} times) recently, totaling ₹${similarItems.reduce((s, t) => s + t.amount, 0).toLocaleString('en-IN')}.`;
    } else if (categoryTotal > 0 && priceNum > categoryTotal * 0.5) {
      recommendation = '⚠️ Consider waiting';
      tone = 'caution';
      reasoning = `This single purchase (₹${priceNum.toLocaleString('en-IN')}) would represent over 50% of your current spending in the ${category} category (₹${categoryTotal.toLocaleString('en-IN')}).`;
    } else if (priceNum > 5000) {
      recommendation = 'ℹ️ Discretionary review';
      tone = 'neutral';
      reasoning = `This is a larger purchase (₹${priceNum.toLocaleString('en-IN')}). Consider waiting 48 hours to confirm it fits your monthly budget.`;
    } else {
      recommendation = '✅ Fits typical spending';
      tone = 'positive';
      reasoning = `This purchase is well within your typical spending profile for ${category}.`;
    }

    res.json({
      product,
      price: priceNum,
      category,
      recommendation,
      tone,
      reasoning,
      stats: {
        categoryTotal,
        similarPurchaseCount: similarItems.length,
        categoryTransactionCount: categoryExpenses.length,
      },
    });
  } catch (error) {
    logger.error('Error evaluating purchase recommendation', { error: error.message });
    res.status(500).json({ message: 'Failed to evaluate purchase recommendation' });
  }
};

module.exports = {
  getSpendingAnalytics,
  chatAssistant,
  evaluatePurchase,
};
