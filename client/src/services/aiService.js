import api from './api';
import {
  generateSpendingAnalytics,
  detectSpendingAnomalies,
} from './automlService';

/**
 * Model Context Protocol (MCP) Tool Registry
 * Standardized tool signatures for the AI Assistant
 */
export const MCP_TOOLS = [
  {
    name: 'get_transactions',
    description: 'Retrieve raw list of transactions filtered by type, category, or limit',
    parameters: { type: 'string', category: 'string', limit: 'number' },
  },
  {
    name: 'get_spending_summary',
    description: 'Retrieve overall financial summary (total expenses, income, balance, average)',
    parameters: { period: 'string' },
  },
  {
    name: 'get_category_spending',
    description: 'Retrieve spending broken down by category with percentages and amounts',
    parameters: { period: 'string' },
  },
  {
    name: 'get_merchant_spending',
    description: 'Retrieve spending grouped by merchant/place',
    parameters: { limit: 'number' },
  },
  {
    name: 'get_spending_trends',
    description: 'Retrieve spending trends over monthly/weekly intervals',
    parameters: {},
  },
  {
    name: 'get_previous_period',
    description: 'Compare current period spending with the prior period',
    parameters: { period: 'string' },
  },
  {
    name: 'detect_unusual_spending',
    description: 'Detect statistical anomalies, outliers, and surge spending',
    parameters: {},
  },
  {
    name: 'get_purchase_history',
    description: 'Search purchase frequency and history for a specific product keyword',
    parameters: { keyword: 'string' },
  },
  {
    name: 'get_ai_insights',
    description: 'Retrieve AI insight cards including savings opportunities and repeated patterns',
    parameters: {},
  },
];

/**
 * Local MCP Tool Executor
 * Executes tool requests against local client-side transaction state
 */
export function executeMcpTool(toolName, args = {}, allTransactions = []) {
  const analytics = generateSpendingAnalytics(allTransactions, args.period || '1M');

  switch (toolName) {
    case 'get_transactions': {
      let filtered = [...allTransactions];
      if (args.type) filtered = filtered.filter((t) => t.type.toLowerCase() === args.type.toLowerCase());
      if (args.category) filtered = filtered.filter((t) => t.category.toLowerCase() === args.category.toLowerCase());
      if (args.limit) filtered = filtered.slice(0, args.limit);
      return filtered;
    }

    case 'get_spending_summary':
      return analytics.summary;

    case 'get_category_spending':
      return analytics.categoryBreakdown;

    case 'get_merchant_spending':
      return analytics.merchantBreakdown.slice(0, args.limit || 10);

    case 'get_spending_trends':
      return analytics.trendData;

    case 'get_previous_period':
      return {
        currentTotal: analytics.summary.totalSpending,
        previousTotal: analytics.summary.prevTotalSpending,
        delta: analytics.summary.spendingDelta,
        percentageChange: analytics.summary.spendingDeltaPct,
      };

    case 'detect_unusual_spending':
      return detectSpendingAnomalies(allTransactions);

    case 'get_purchase_history': {
      const keyword = (args.keyword || '').toLowerCase();
      return allTransactions.filter((t) =>
        t.title.toLowerCase().includes(keyword)
      );
    }

    case 'get_ai_insights':
      return analytics.insights;

    default:
      return { error: `Tool ${toolName} not found` };
  }
}

/**
 * Send Chat Query to AI Assistant (with backend Gemini & MCP fallback)
 */
export async function sendAIChatMessage(question, allTransactions = []) {
  try {
    const res = await api.post('/ai/chat', { question });
    return res.data;
  } catch (error) {
    console.warn('Backend AI chat error, running local deterministic fallback:', error);

    // Fallback: Local MCP Tool Processing
    const lower = question.toLowerCase();
    const analytics = generateSpendingAnalytics(allTransactions, '1M');
    const toolsUsed = [];

    let reply = '';

    if (lower.includes('where') || lower.includes('most') || lower.includes('highest')) {
      toolsUsed.push('get_category_spending');
      const top = analytics.categoryBreakdown[0];
      if (top) {
        reply = `You spent the most on **${top.category}** (₹${top.amount.toLocaleString('en-IN')}), which accounts for **${top.percentage}%** of your total spending in this period.`;
      } else {
        reply = 'No expense data is available yet for this period.';
      }
    } else if (lower.includes('why') || lower.includes('higher') || lower.includes('increase')) {
      toolsUsed.push('get_previous_period', 'get_category_spending');
      const delta = analytics.summary.spendingDelta;
      const pct = analytics.summary.spendingDeltaPct;
      const topCategory = analytics.categoryBreakdown[0];
      reply = `Your spending is **${delta >= 0 ? '+' : ''}₹${Math.abs(delta).toLocaleString('en-IN')} (${pct}%)** compared to the prior period. The highest contributor was **${topCategory?.category || 'General Spending'}** (₹${topCategory?.amount.toLocaleString('en-IN') || 0}).`;
    } else if (lower.includes('unusual') || lower.includes('anomaly') || lower.includes('flag')) {
      toolsUsed.push('detect_unusual_spending');
      if (analytics.anomalies.length > 0) {
        const a = analytics.anomalies[0];
        reply = `I detected **${analytics.anomalies.length} unusual expense(s)**. For instance: **${a.title}** (₹${a.amount.toLocaleString('en-IN')}) is significantly higher than your average purchase.`;
      } else {
        reply = 'No unusual spending anomalies detected in your recent records. Your expenses are consistent with historical averages.';
      }
    } else if (lower.includes('save') || lower.includes('saving') || lower.includes('reduce')) {
      toolsUsed.push('get_spending_summary', 'get_ai_insights');
      reply = `You could potentially save **₹${analytics.summary.potentialSavings.toLocaleString('en-IN')}** per month by reviewing discretionary expenses in Shopping and Entertainment.`;
    } else {
      toolsUsed.push('get_spending_summary', 'get_transactions');
      reply = `You have recorded **₹${analytics.summary.totalSpending.toLocaleString('en-IN')}** across ${analytics.summary.transactionCount} transactions. Top category: **${analytics.summary.highestSpendingCategory}**. What specific insight would you like to explore?`;
    }

    return {
      reply,
      toolsUsed,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Evaluate Purchase Proposal ("Should I Buy This?")
 */
export async function evaluatePurchaseRecommendation(product, price, category, allTransactions = []) {
  try {
    const res = await api.post('/ai/purchase-recommendation', { product, price, category });
    return res.data;
  } catch (error) {
    console.warn('Backend purchase evaluation fallback:', error);

    const priceNum = parseFloat(price) || 0;
    const analytics = generateSpendingAnalytics(allTransactions, '1M');
    const categoryExp = analytics.categoryBreakdown.find((c) => c.category.toLowerCase() === category.toLowerCase());
    const catTotal = categoryExp?.amount || 0;

    // Search similar items
    const words = product.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const similar = allTransactions.filter((t) =>
      words.some((w) => t.title.toLowerCase().includes(w))
    );

    let recommendation = '✅ Fits typical spending';
    let tone = 'positive';
    let reasoning = `This purchase is well within your typical spending profile for ${category}.`;

    if (similar.length >= 3) {
      recommendation = '⚠️ Consider skipping';
      tone = 'warning';
      reasoning = `You already purchased similar items (${similar.length} times) recently. You may already have enough similar items.`;
    } else if (catTotal > 0 && priceNum > catTotal * 0.45) {
      recommendation = '⚠️ Consider waiting';
      tone = 'caution';
      reasoning = `This single purchase (₹${priceNum.toLocaleString('en-IN')}) would represent over 45% of your current monthly spending in ${category} (₹${catTotal.toLocaleString('en-IN')}).`;
    } else if (priceNum >= 5000) {
      recommendation = 'ℹ️ Discretionary review';
      tone = 'neutral';
      reasoning = `This is a larger investment (₹${priceNum.toLocaleString('en-IN')}). Consider sleeping on it for 48 hours to confirm it fits your monthly budget.`;
    }

    return {
      product,
      price: priceNum,
      category,
      recommendation,
      tone,
      reasoning,
      stats: {
        categoryTotal: catTotal,
        similarPurchaseCount: similar.length,
        categoryTransactionCount: similar.length,
      },
    };
  }
}
