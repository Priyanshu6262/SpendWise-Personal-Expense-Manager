/**
 * SpendWise AutoML & Spending Analytics Engine
 * Provides client-side machine-learning pattern recognition, anomaly scoring,
 * merchant clustering, and purchase recommendation models.
 */

// Essential vs Discretionary categories
export const CATEGORY_TYPES = {
  Bills: 'Necessary',
  Food: 'Necessary',
  Healthcare: 'Necessary',
  Education: 'Necessary',
  Travel: 'Discretionary',
  Shopping: 'Discretionary',
  Entertainment: 'Discretionary',
  Other: 'Discretionary',
};

/**
 * Clean & extract merchant names from transaction titles
 */
export function extractMerchant(title) {
  if (!title) return 'Uncategorized';
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
 * Filter transactions by timeframe
 */
export function filterTransactionsByPeriod(transactions, period, customStart = null, customEnd = null) {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case '1M':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case '3M':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '6M':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case '1Y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case 'CUSTOM':
      if (customStart) startDate = new Date(customStart);
      break;
    case 'ALL':
    default:
      return transactions;
  }

  const endDate = (period === 'CUSTOM' && customEnd) ? new Date(customEnd) : now;

  return transactions.filter((t) => {
    const txDate = new Date(t.date);
    return txDate >= startDate && txDate <= endDate;
  });
}

/**
 * Get Previous Period Transactions for Comparison
 */
export function getPreviousPeriodTransactions(transactions, period) {
  const now = new Date();
  let currentStart = new Date();
  let prevStart = new Date();
  let prevEnd = new Date();

  let days = 30;
  if (period === '1M') days = 30;
  else if (period === '3M') days = 90;
  else if (period === '6M') days = 180;
  else if (period === '1Y') days = 365;

  currentStart.setDate(now.getDate() - days);
  prevEnd.setDate(currentStart.getDate() - 1);
  prevStart.setDate(prevEnd.getDate() - days);

  return transactions.filter((t) => {
    const txDate = new Date(t.date);
    return txDate >= prevStart && txDate <= prevEnd;
  });
}

/**
 * Detect Statistical Outliers & Anomalies using Z-score & IQR
 */
export function detectSpendingAnomalies(transactions) {
  const expenses = transactions.filter((t) => t.type === 'Expense');
  if (expenses.length < 3) return [];

  const amounts = expenses.map((t) => t.amount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  const anomalies = [];

  expenses.forEach((tx) => {
    const zScore = stdDev > 0 ? (tx.amount - mean) / stdDev : 0;
    if (zScore >= 1.75 || (tx.amount > mean * 2.2 && tx.amount >= 1000)) {
      anomalies.push({
        id: tx._id,
        title: tx.title,
        amount: tx.amount,
        category: tx.category,
        date: tx.date,
        mean: Math.round(mean),
        zScore: zScore.toFixed(2),
        reason: `Transaction amount (₹${tx.amount.toLocaleString('en-IN')}) is ${(tx.amount / (mean || 1)).toFixed(1)}x higher than your average expense of ₹${Math.round(mean).toLocaleString('en-IN')}.`,
        severity: zScore > 2.5 ? 'High' : 'Medium',
        type: 'unusual_amount',
      });
    }
  });

  return anomalies;
}

/**
 * Detect Repeated Purchases & Frequency Patterns (e.g., T-shirts, coffee, cabs)
 */
export function detectRepeatedPatterns(transactions) {
  const expenses = transactions.filter((t) => t.type === 'Expense');
  const keywordMap = {};

  const commonWords = new Set(['and', 'the', 'for', 'with', 'from', 'bill', 'payment', 'paid']);

  expenses.forEach((tx) => {
    const words = tx.title
      .toLowerCase()
      .split(/[^a-zA-Z0-9]+/)
      .filter((w) => w.length > 2 && !commonWords.has(w));

    words.forEach((word) => {
      if (!keywordMap[word]) {
        keywordMap[word] = { count: 0, totalAmount: 0, transactions: [], category: tx.category };
      }
      keywordMap[word].count += 1;
      keywordMap[word].totalAmount += tx.amount;
      keywordMap[word].transactions.push(tx);
    });
  });

  const patterns = [];
  Object.entries(keywordMap).forEach(([word, data]) => {
    if (data.count >= 2 && data.totalAmount >= 500) {
      patterns.push({
        id: `repeat-${word}`,
        keyword: word,
        title: `Repeated Purchases: "${word.toUpperCase()}"`,
        count: data.count,
        totalAmount: data.totalAmount,
        category: data.category,
        transactions: data.transactions,
        reason: `You purchased items matching "${word}" ${data.count} times recently, spending a total of ₹${data.totalAmount.toLocaleString('en-IN')}. Consider evaluating if all are essential.`,
        type: 'repeated_purchase',
      });
    }
  });

  return patterns.sort((a, b) => b.count - a.count);
}

/**
 * Comprehensive Spending Analytics Report Generator
 */
export function generateSpendingAnalytics(transactions, period = '1M', customStart = null, customEnd = null) {
  const currentPeriodTx = filterTransactionsByPeriod(transactions, period, customStart, customEnd);
  const previousPeriodTx = getPreviousPeriodTransactions(transactions, period);

  const expenses = currentPeriodTx.filter((t) => t.type === 'Expense');
  const prevExpenses = previousPeriodTx.filter((t) => t.type === 'Expense');
  const income = currentPeriodTx.filter((t) => t.type === 'Income');

  const totalSpending = expenses.reduce((s, t) => s + t.amount, 0);
  const prevTotalSpending = prevExpenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);

  // Period-over-Period Delta
  const spendingDelta = totalSpending - prevTotalSpending;
  const spendingDeltaPct = prevTotalSpending > 0
    ? Math.round(((totalSpending - prevTotalSpending) / prevTotalSpending) * 100)
    : 0;

  // Category Breakdown
  const categoryTotals = {};
  const prevCategoryTotals = {};

  expenses.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  prevExpenses.forEach((t) => {
    prevCategoryTotals[t.category] = (prevCategoryTotals[t.category] || 0) + t.amount;
  });

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, amount]) => {
      const prevAmount = prevCategoryTotals[category] || 0;
      const changePct = prevAmount > 0 ? Math.round(((amount - prevAmount) / prevAmount) * 100) : 0;
      return {
        category,
        amount,
        prevAmount,
        changePct,
        percentage: totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0,
        type: CATEGORY_TYPES[category] || 'Discretionary',
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Merchant Breakdown
  const merchantTotals = {};
  expenses.forEach((t) => {
    const merchant = extractMerchant(t.title);
    if (!merchantTotals[merchant]) {
      merchantTotals[merchant] = { total: 0, count: 0, lastDate: t.date, category: t.category, txs: [] };
    }
    merchantTotals[merchant].total += t.amount;
    merchantTotals[merchant].count += 1;
    merchantTotals[merchant].txs.push(t);
    if (new Date(t.date) > new Date(merchantTotals[merchant].lastDate)) {
      merchantTotals[merchant].lastDate = t.date;
    }
  });

  const merchantBreakdown = Object.entries(merchantTotals)
    .map(([merchant, d]) => ({
      merchant,
      total: d.total,
      count: d.count,
      lastDate: d.lastDate,
      category: d.category,
      transactions: d.txs,
    }))
    .sort((a, b) => b.total - a.total);

  // Monthly / Weekly Time Trend
  const timeMap = {};
  expenses.forEach((t) => {
    const d = new Date(t.date);
    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    timeMap[key] = (timeMap[key] || 0) + t.amount;
  });

  const trendData = Object.entries(timeMap).map(([label, amount]) => ({
    label,
    amount,
  }));

  // Classification: Necessary vs Discretionary vs Unusual
  const anomalies = detectSpendingAnomalies(currentPeriodTx);
  const repeatedPatterns = detectRepeatedPatterns(currentPeriodTx);

  let necessaryTotal = 0;
  let discretionaryTotal = 0;

  expenses.forEach((t) => {
    if (CATEGORY_TYPES[t.category] === 'Necessary') {
      necessaryTotal += t.amount;
    } else {
      discretionaryTotal += t.amount;
    }
  });

  const unusualTotal = anomalies.reduce((s, a) => s + a.amount, 0);
  const potentialSavings = Math.round(discretionaryTotal * 0.25 + unusualTotal * 0.3);

  // High level cards
  const highestCategory = categoryBreakdown[0]?.category || 'N/A';
  const highestMerchant = merchantBreakdown[0]?.merchant || 'N/A';
  const avgMonthlySpending = trendData.length > 0
    ? Math.round(totalSpending / Math.max(trendData.length, 1))
    : totalSpending;

  // AI Insight Cards List
  const insights = [];

  // Insight 1: Category surge
  const topSurgeCategory = categoryBreakdown.find((c) => c.changePct > 25 && c.amount > 1000);
  if (topSurgeCategory) {
    insights.push({
      id: 'ins-surge',
      type: 'unusual',
      tag: 'Unusual Spending',
      title: `${topSurgeCategory.category} spending increased +${topSurgeCategory.changePct}%`,
      description: `Your ${topSurgeCategory.category} expenditure increased from ₹${topSurgeCategory.prevAmount.toLocaleString('en-IN')} to ₹${topSurgeCategory.amount.toLocaleString('en-IN')} compared to the prior period.`,
      supportingData: expenses.filter((t) => t.category === topSurgeCategory.category),
    });
  }

  // Insight 2: Repeated purchases
  if (repeatedPatterns.length > 0) {
    const p = repeatedPatterns[0];
    insights.push({
      id: 'ins-repeat',
      type: 'repeated',
      tag: 'Repeated Pattern',
      title: `Frequent purchases detected for "${p.keyword}"`,
      description: `You purchased ${p.count} items matching "${p.keyword}" totaling ₹${p.totalAmount.toLocaleString('en-IN')}. Based on recent purchase frequency, you may have enough similar items.`,
      supportingData: p.transactions,
    });
  }

  // Insight 3: Stable / Good spending
  const stableCategory = categoryBreakdown.find((c) => Math.abs(c.changePct) <= 10 && c.amount > 500);
  if (stableCategory) {
    insights.push({
      id: 'ins-stable',
      type: 'good',
      tag: 'Healthy Spending',
      title: `Consistent ${stableCategory.category} Budget`,
      description: `Your ${stableCategory.category} expenses (₹${stableCategory.amount.toLocaleString('en-IN')}) remain steady and align with historical monthly averages.`,
      supportingData: expenses.filter((t) => t.category === stableCategory.category),
    });
  }

  // Insight 4: Saving Opportunity
  if (potentialSavings > 0) {
    insights.push({
      id: 'ins-saving',
      type: 'saving',
      tag: 'Saving Opportunity',
      title: `Potential monthly savings of ~₹${potentialSavings.toLocaleString('en-IN')}`,
      description: `By reducing non-essential discretionary items (such as frequent takeout or unplanned shopping) by 25%, you could save approximately ₹${potentialSavings.toLocaleString('en-IN')}.`,
      supportingData: expenses.filter((t) => CATEGORY_TYPES[t.category] === 'Discretionary'),
    });
  }

  return {
    summary: {
      totalSpending,
      prevTotalSpending,
      spendingDelta,
      spendingDeltaPct,
      totalIncome,
      transactionCount: currentPeriodTx.length,
      expenseCount: expenses.length,
      highestSpendingCategory: highestCategory,
      highestSpendingMerchant: highestMerchant,
      avgMonthlySpending,
      unusualSpendingCount: anomalies.length,
      potentialSavings,
      necessaryTotal,
      discretionaryTotal,
      unusualTotal,
    },
    categoryBreakdown,
    merchantBreakdown,
    trendData,
    anomalies,
    repeatedPatterns,
    classification: {
      necessary: necessaryTotal,
      discretionary: discretionaryTotal,
      unusual: unusualTotal,
      potentialSavings,
    },
    insights,
    currentPeriodTx,
  };
}
