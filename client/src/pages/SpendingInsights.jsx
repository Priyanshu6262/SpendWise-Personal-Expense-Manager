import React, { useState, useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';
import {
  Sparkles,
  Calendar,
  Wallet,
  Store,
  Tag,
  PiggyBank,
  RefreshCw,
  ShoppingBag,
  Bot,
} from 'lucide-react';
import { generateSpendingAnalytics } from '../services/automlService';
import DonutChart from '../components/analytics/DonutChart';
import TrendChart from '../components/analytics/TrendChart';
import MerchantList from '../components/analytics/MerchantList';
import ComparisonCard from '../components/analytics/ComparisonCard';
import SpendingClassificationChart from '../components/analytics/SpendingClassificationChart';
import InsightCard from '../components/analytics/InsightCard';
import PurchaseAdvisor from '../components/analytics/PurchaseAdvisor';
import AIAssistantChat from '../components/analytics/AIAssistantChat';

const SpendingInsights = () => {
  const { transactions, loading, fetchTransactions } = useTransactions();

  // Date Filter State
  const [period, setPeriod] = useState('1M'); // '1M' | '3M' | '6M' | '1Y' | 'CUSTOM'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Compute Machine-Learning Analytics
  const analytics = generateSpendingAnalytics(transactions, period, customStart, customEnd);
  const { summary, categoryBreakdown, merchantBreakdown, trendData, insights, classification } = analytics;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Page Header & Date Range Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Spending Insights
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              AutoML & AI Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Understand where your money goes, detect unusual spending, and optimize your monthly budget
          </p>
        </div>

        {/* Date Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {['1M', '3M', '6M', '1Y', 'CUSTOM'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md ${
                  period === p
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p === '1M' ? '1 Month' : p === '3M' ? '3 Months' : p === '6M' ? '6 Months' : p === '1Y' ? '1 Year' : 'Custom'}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchTransactions()}
            className="app-btn-secondary p-2 text-xs"
            title="Refresh Data"
            disabled={loading}
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Custom Date Range Selectors */}
      {period === 'CUSTOM' && (
        <div className="app-card p-3 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="app-input py-1 px-2 text-xs max-w-[150px]"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="app-input py-1 px-2 text-xs max-w-[150px]"
            />
          </div>
        </div>
      )}

      {/* 2. Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spending */}
        <div className="app-card p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Total Spending</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            ₹{summary.totalSpending.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>{summary.expenseCount} expenses in period</span>
          </div>
        </div>

        {/* Highest Category */}
        <div className="app-card p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Top Category</span>
            <Tag className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 truncate">
            {summary.highestSpendingCategory}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {categoryBreakdown[0] ? `₹${categoryBreakdown[0].amount.toLocaleString('en-IN')} (${categoryBreakdown[0].percentage}%)` : 'No data'}
          </div>
        </div>

        {/* Highest Merchant */}
        <div className="app-card p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Top Merchant / Place</span>
            <Store className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 truncate">
            {summary.highestSpendingMerchant}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {merchantBreakdown[0] ? `₹${merchantBreakdown[0].total.toLocaleString('en-IN')} (${merchantBreakdown[0].count} orders)` : 'No data'}
          </div>
        </div>

        {/* Potential Savings */}
        <div className="app-card p-4 sm:p-5 border-emerald-200/80 bg-emerald-50/30">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            <span>Potential Savings</span>
            <PiggyBank className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-2">
            ~₹{summary.potentialSavings.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-700/80 mt-1">
            {summary.unusualSpendingCount} outlier(s) detected
          </div>
        </div>
      </div>

      {/* 3. Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visualization 1 — Category Breakdown */}
        <div className="app-card p-5 sm:p-6">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-900">Category Breakdown</h2>
            <p className="text-xs text-slate-500">Distribution of spending across expense categories</p>
          </div>
          <DonutChart data={categoryBreakdown} total={summary.totalSpending} />
        </div>

        {/* Visualization 2 — Spending Trend */}
        <div className="app-card p-5 sm:p-6">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-900">Spending Trend Over Time</h2>
            <p className="text-xs text-slate-500">Trajectory and monthly spending velocity</p>
          </div>
          <TrendChart data={trendData} />
        </div>

        {/* Visualization 3 — Merchant / Place Analysis */}
        <div className="app-card p-5 sm:p-6">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-900">Merchant & Place Analysis</h2>
            <p className="text-xs text-slate-500">Where you spend the most money and transaction frequency</p>
          </div>
          <MerchantList data={merchantBreakdown} />
        </div>

        {/* Visualization 4 — Spending Comparison */}
        <div className="app-card p-5 sm:p-6">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-900">Period-over-Period Comparison</h2>
            <p className="text-xs text-slate-500">Compare current spending with the previous cycle</p>
          </div>
          <ComparisonCard
            currentTotal={summary.totalSpending}
            prevTotal={summary.prevTotalSpending}
            delta={summary.spendingDelta}
            deltaPct={summary.spendingDeltaPct}
            categoryBreakdown={categoryBreakdown}
          />
        </div>
      </div>

      {/* Visualization 5 — Useful vs Unusual / Discretionary Spending */}
      <div className="app-card p-5 sm:p-6">
        <div className="pb-3 border-b border-slate-100 mb-4">
          <h2 className="text-base font-bold text-slate-900">Necessary vs. Discretionary Spending</h2>
          <p className="text-xs text-slate-500">Automated classification of essential budget vs lifestyle items</p>
        </div>
        <SpendingClassificationChart
          necessary={classification.necessary}
          discretionary={classification.discretionary}
          unusual={classification.unusual}
          potentialSavings={classification.potentialSavings}
          total={summary.totalSpending}
        />
      </div>

      {/* 4. AI Detected Patterns & Anomaly Insight Cards */}
      <div className="space-y-4">
        <div className="pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">AI Detected Spending Patterns</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated machine-learning insights comparing your current habits with historical baselines
          </p>
        </div>

        {insights.length === 0 ? (
          <div className="app-card p-6 text-center text-xs text-slate-500">
            No anomalous spending patterns detected. Your transactions match typical baseline habits.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </div>

      {/* 5. "Should I Buy This?" Purchase Advisor */}
      <div className="app-card p-5 sm:p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <ShoppingBag className="w-4 h-4 text-emerald-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">"Should I Buy This?" Purchase Advisor</h2>
            <p className="text-xs text-slate-500">Evaluate a planned purchase before spending</p>
          </div>
        </div>
        <PurchaseAdvisor allTransactions={transactions} />
      </div>

      {/* 6. AI Personal Finance Assistant */}
      <div className="app-card p-5 sm:p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <Bot className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">AI Personal Finance Assistant</h2>
            <p className="text-xs text-slate-500">
              Interactive conversational assistant powered by your live transaction data and MCP tools
            </p>
          </div>
        </div>
        <AIAssistantChat allTransactions={transactions} />
      </div>
    </div>
  );
};

export default SpendingInsights;
