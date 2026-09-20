import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  PiggyBank,
  Wallet,
  Bot,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  Food:          '#F59E0B',
  Shopping:      '#EC4899',
  Bills:         '#6366F1',
  Travel:        '#06B6D4',
  Entertainment: '#8B5CF6',
  Healthcare:    '#EF4444',
  Education:     '#3B82F6',
  Other:         '#10B981',
};

const STATUS_CONFIG = {
  over_budget:  { label: 'Over Budget',  color: '#EF4444', bg: '#EF4444', icon: AlertCircle },
  on_track:     { label: 'On Track',     color: '#F59E0B', bg: '#F59E0B', icon: Minus },
  under_budget: { label: 'Under Budget', color: '#10B981', bg: '#10B981', icon: CheckCircle2 },
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount || 0);


// ─── Category Budget Card ────────────────────────────────────────────────────
const CategoryBudgetCard = ({ rec }) => {
  const color = CATEGORY_COLORS[rec.category] || '#94A3B8';
  const status = STATUS_CONFIG[rec.status] || STATUS_CONFIG.on_track;
  const StatusIcon = status.icon;
  const usagePct = rec.recommended_budget > 0
    ? Math.min(100, Math.round((rec.current_month_spend / rec.recommended_budget) * 100))
    : 0;

  const barColor =
    rec.status === 'over_budget'  ? '#EF4444' :
    rec.status === 'on_track'     ? '#F59E0B' : '#10B981';

  return (
    <div className="bg-[#0F172A] border border-[#263449] rounded-xl p-4 hover:border-[#263449]/80 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-bold text-[#F8FAFC]">{rec.category}</span>
          {rec.type === 'needs' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/30 font-semibold">
              Essential
            </span>
          )}
        </div>
        <div
          className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${status.bg}15`, color: status.color, border: `1px solid ${status.bg}30` }}
        >
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </div>
      </div>

      {/* Amounts */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-[11px] text-[#64748B] mb-0.5">Recommended Budget</p>
          <p className="text-lg font-bold" style={{ color }}>{formatCurrency(rec.recommended_budget)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-[#64748B] mb-0.5">This Month</p>
          <p className={`text-sm font-bold ${rec.status === 'over_budget' ? 'text-[#EF4444]' : 'text-[#94A3B8]'}`}>
            {formatCurrency(rec.current_month_spend)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#111C2E] border border-[#263449] h-2 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${usagePct}%`, backgroundColor: barColor }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[#64748B]">{usagePct}% used</span>
        <span className="text-[#94A3B8] flex items-center gap-1">
          {rec.trend_pct > 5 ? (
            <><TrendingUp className="w-3 h-3 text-[#EF4444]" /> <span className="text-[#EF4444]">+{rec.trend_pct}% MoM</span></>
          ) : rec.trend_pct < -5 ? (
            <><TrendingDown className="w-3 h-3 text-[#10B981]" /> <span className="text-[#10B981]">{rec.trend_pct}% MoM</span></>
          ) : (
            <><Minus className="w-3 h-3 text-[#64748B]" /> <span>Stable</span></>
          )}
        </span>
      </div>

      {/* 3-month avg */}
      <div className="mt-2 pt-2 border-t border-[#263449]/60">
        <span className="text-[11px] text-[#64748B]">
          3-month avg: <span className="text-[#94A3B8] font-medium">{formatCurrency(rec.avg_monthly_spend)}</span>
        </span>
      </div>
    </div>
  );
};


// ─── Main BudgetRecommendations Component ───────────────────────────────────
const BudgetRecommendations = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai/budget');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load budget recommendations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-8 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#6366F1] border-t-transparent animate-spin" />
        <p className="text-xs text-[#94A3B8]">Analyzing your transaction history…</p>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-[#111C2E] border border-[#EF4444]/30 rounded-xl p-6 flex flex-col items-center gap-2 text-center">
        <AlertCircle className="w-8 h-8 text-[#EF4444]" />
        <p className="text-sm text-[#F8FAFC] font-semibold">Unable to load recommendations</p>
        <p className="text-xs text-[#94A3B8]">{error}</p>
        <button
          onClick={fetchRecommendations}
          className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-[#0F172A] border border-[#263449] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#10B981]/40 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Empty State ────────────────────────────────────────────────────────────
  if (!data || data.status === 'empty') {
    return (
      <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-8 flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-[#0F172A] border border-[#263449] flex items-center justify-center">
          <PiggyBank className="w-7 h-7 text-[#64748B]" />
        </div>
        <p className="text-sm font-bold text-[#F8FAFC]">No budget data yet</p>
        <p className="text-xs text-[#94A3B8] max-w-sm">
          Add at least 1 month of income and expense transactions to unlock personalized AI budget recommendations.
        </p>
      </div>
    );
  }

  const { summary, category_recommendations = [], llm_explanation, raw_insights = [] } = data;
  const displayRecs = showAllCategories ? category_recommendations : category_recommendations.slice(0, 6);
  const savingsPct = summary?.savings_pct || 0;

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC]">AI Budget Recommendations</h2>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Personalized limits based on your {summary?.months_analyzed || 3}-month spending history in INR
          </p>
        </div>
        <button
          onClick={fetchRecommendations}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-[#0F172A] border border-[#263449] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#10B981]/40 transition-all self-start sm:self-auto"
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>



      {/* Summary Row */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Avg Monthly Income', value: formatCurrency(summary.avg_monthly_income), icon: Wallet, color: '#10B981' },
            { label: 'Avg Monthly Expenses', value: formatCurrency(summary.avg_monthly_expense), icon: TrendingDown, color: '#EF4444' },
            { label: 'Current Savings', value: formatCurrency(summary.current_savings), icon: PiggyBank, color: savingsPct >= 20 ? '#10B981' : '#F59E0B' },
            { label: 'Savings Rate', value: `${savingsPct}%`, icon: Target, color: savingsPct >= 20 ? '#10B981' : '#F59E0B' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#0F172A] border border-[#263449] rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5" style={{ color }} />
                <span className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">{label}</span>
              </div>
              <p className="text-base font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Savings Gap Warning */}
      {summary?.savings_gap > 500 && (
        <div className="flex items-start gap-3 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#F59E0B]">Savings Gap Detected</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              To reach your 20% savings target of {formatCurrency(summary.ideal_savings)}/month, consider reducing expenses by{' '}
              <span className="text-[#F8FAFC] font-semibold">{formatCurrency(summary.savings_gap)}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Category Budget Cards Grid */}
      {category_recommendations.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[#F8FAFC] mb-3">
            Category Budget Limits
            <span className="ml-2 text-xs font-normal text-[#64748B]">Based on your spending patterns</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayRecs.map((rec) => (
              <CategoryBudgetCard key={rec.category} rec={rec} />
            ))}
          </div>

          {category_recommendations.length > 6 && (
            <button
              onClick={() => setShowAllCategories((v) => !v)}
              className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-xl bg-[#0F172A] border border-[#263449] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#10B981]/40 transition-all"
            >
              {showAllCategories ? (
                <><ChevronUp className="w-4 h-4" /> Show Less</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> Show All {category_recommendations.length} Categories</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Raw Insights Bullets */}
      {raw_insights.length > 0 && (
        <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-sm font-bold text-[#F8FAFC]">Key Insights</h3>
          </div>
          <ul className="space-y-2">
            {raw_insights.slice(0, 5).map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-[#94A3B8]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 flex-shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BudgetRecommendations;
