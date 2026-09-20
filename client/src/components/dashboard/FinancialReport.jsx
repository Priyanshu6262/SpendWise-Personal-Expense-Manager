import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Calendar,
  Bot,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────
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

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount || 0);

const formatCurrencyCompact = (amount) => {
  const n = Math.abs(amount || 0);
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
};


// ─── Tiny Sparkline SVG Chart ─────────────────────────────────────────────────
const SparkLine = ({ data = [], color = '#10B981', height = 48 }) => {
  if (!data || data.length < 2) {
    return <div className="h-12 flex items-center justify-center text-xs text-[#64748B]">No trend data</div>;
  }
  const amounts = data.map((d) => d.amount);
  const max = Math.max(...amounts, 1);
  const min = Math.min(...amounts, 0);
  const range = max - min || 1;
  const W = 320;
  const H = height;
  const pts = amounts.map((a, i) => {
    const x = (i / (amounts.length - 1)) * W;
    const y = H - ((a - min) / range) * (H - 8) - 4;
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(' L ')}`;
  const areaD = `${pathD} L ${W},${H} L 0,${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sg-${color.replace('#','')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};


// ─── Category Change Row ──────────────────────────────────────────────────────
const CategoryChangeRow = ({ cat }) => {
  const color  = CATEGORY_COLORS[cat.category] || '#94A3B8';
  const isUp   = cat.direction === 'up';
  const isDown = cat.direction === 'down';

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#263449]/50 last:border-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-sm font-medium text-[#F8FAFC] truncate">{cat.category}</span>
      </div>
      <div className="flex items-center gap-3 text-xs flex-shrink-0">
        <span className="text-[#94A3B8]">{formatCurrencyCompact(cat.current_amount)}</span>
        {isUp && (
          <span className="flex items-center gap-0.5 text-[#EF4444] font-semibold">
            <TrendingUp className="w-3 h-3" /> +{cat.change_pct}%
          </span>
        )}
        {isDown && (
          <span className="flex items-center gap-0.5 text-[#10B981] font-semibold">
            <TrendingDown className="w-3 h-3" /> {cat.change_pct}%
          </span>
        )}
        {!isUp && !isDown && (
          <span className="flex items-center gap-0.5 text-[#64748B]">
            <Minus className="w-3 h-3" /> stable
          </span>
        )}
      </div>
    </div>
  );
};


// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, subValue, icon: Icon, color, changePct }) => {
  const isPositiveChange = changePct !== undefined && changePct > 0;
  const isNegativeChange = changePct !== undefined && changePct < 0;
  return (
    <div className="bg-[#0F172A] border border-[#263449] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      {(subValue || changePct !== undefined) && (
        <div className="flex items-center gap-2 mt-1">
          {subValue && <span className="text-[11px] text-[#64748B]">{subValue}</span>}
          {changePct !== undefined && (
            <span
              className="text-[11px] font-semibold flex items-center gap-0.5"
              style={{ color: isPositiveChange ? '#EF4444' : isNegativeChange ? '#10B981' : '#64748B' }}
            >
              {isPositiveChange && <TrendingUp className="w-3 h-3" />}
              {isNegativeChange && <TrendingDown className="w-3 h-3" />}
              {changePct > 0 ? '+' : ''}{changePct}% vs prev
            </span>
          )}
        </div>
      )}
    </div>
  );
};


// ─── Main Component ──────────────────────────────────────────────────────────
const FinancialReport = () => {
  const [period, setPeriod]     = useState('monthly');
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [showAllCats, setShowAllCats] = useState(false);

  const fetchReport = useCallback(async (p = period) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai/report', { period: p });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchReport(period); }, [period]);

  const handlePeriodChange = (p) => {
    setPeriod(p);
    setData(null);
    setShowAllCats(false);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]">
        <div className="w-10 h-10 rounded-full border-2 border-[#6366F1] border-t-transparent animate-spin" />
        <p className="text-xs text-[#94A3B8]">Generating {period} financial report…</p>
      </div>
    );
  }

  // ── Header (always visible) ────────────────────────────────────────────────
  const Header = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC]">Financial Reports</h2>
        </div>
        <p className="text-xs text-[#94A3B8]">Verified analytics with AI-generated natural-language summaries</p>
      </div>

      <div className="flex items-center gap-2">
        {/* Period Switcher */}
        <div className="flex items-center gap-1 bg-[#0F172A] border border-[#263449] p-1 rounded-lg">
          {['weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
                period === p
                  ? 'bg-[#6366F1] text-white shadow-md'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => fetchReport(period)}
          className="p-2 rounded-lg bg-[#0F172A] border border-[#263449] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#10B981]/40 transition-all"
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-4">
        {Header}
        <div className="bg-[#111C2E] border border-[#EF4444]/30 rounded-xl p-6 flex flex-col items-center gap-2 text-center">
          <AlertCircle className="w-8 h-8 text-[#EF4444]" />
          <p className="text-sm text-[#F8FAFC] font-semibold">Report unavailable</p>
          <p className="text-xs text-[#94A3B8]">{error}</p>
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (!data || data.status === 'empty') {
    return (
      <div className="space-y-4">
        {Header}
        <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-8 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-[#0F172A] border border-[#263449] flex items-center justify-center">
            <FileText className="w-7 h-7 text-[#64748B]" />
          </div>
          <p className="text-sm font-bold text-[#F8FAFC]">No {period} data yet</p>
          <p className="text-xs text-[#94A3B8] max-w-sm">
            {data?.message || `Log some transactions this ${period === 'weekly' ? 'week' : 'month'} to generate your first AI financial report.`}
          </p>
        </div>
      </div>
    );
  }

  const {
    current = {},
    previous = {},
    changes = {},
    category_comparison = [],
    daily_trend = [],
    prev_daily_trend = [],
    llm_summary,
    current_period_label,
    previous_period_label,
    projected_month_end,
  } = data;

  const displayCats = showAllCats ? category_comparison : category_comparison.slice(0, 5);

  return (
    <div className="space-y-5">
      {Header}

      {/* Period Labels */}
      <div className="flex items-center gap-2 text-xs text-[#64748B]">
        <Calendar className="w-3.5 h-3.5" />
        <span className="font-semibold text-[#94A3B8]">{current_period_label}</span>
        <span>vs.</span>
        <span>{previous_period_label}</span>
      </div>

      {/* AI Summary Banner */}
      {llm_summary && (
        <div className="bg-[#111C2E] border border-[#6366F1]/30 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#6366F1]/15 border border-[#6366F1]/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#6366F1]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#6366F1] mb-1 uppercase tracking-wider">
                AI Report Summary
              </p>
              <p className="text-sm text-[#F8FAFC] leading-relaxed">{llm_summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Income"
          value={formatCurrencyCompact(current.total_income)}
          subValue={`Prev: ${formatCurrencyCompact(previous.total_income)}`}
          icon={ArrowUpRight}
          color="#10B981"
          changePct={changes.income_pct}
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrencyCompact(current.total_expense)}
          subValue={`Prev: ${formatCurrencyCompact(previous.total_expense)}`}
          icon={ArrowDownRight}
          color="#EF4444"
          changePct={changes.expense_pct}
        />
        <StatCard
          label="Savings"
          value={formatCurrencyCompact(current.savings)}
          subValue={`${current.savings_pct}% of income`}
          icon={PiggyBank}
          color={current.savings_pct >= 20 ? '#10B981' : '#F59E0B'}
          changePct={changes.savings_pct}
        />
        <StatCard
          label={period === 'monthly' ? 'Projected End' : 'Transactions'}
          value={period === 'monthly' ? formatCurrencyCompact(projected_month_end) : current.transaction_count}
          subValue={period === 'monthly' ? 'Month-end estimate' : `${current.expense_count} expenses`}
          icon={period === 'monthly' ? BarChart3 : Wallet}
          color="#6366F1"
        />
      </div>

      {/* Spending Trend Chart */}
      <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">Expense Trend</h3>
            <p className="text-[11px] text-[#94A3B8]">Daily spending — current vs. previous {period === 'weekly' ? 'week' : 'month'}</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-[#EF4444]">
              <span className="w-3 h-0.5 bg-[#EF4444] rounded-full" /> Current
            </span>
            <span className="flex items-center gap-1 text-[#64748B]">
              <span className="w-3 h-0.5 bg-[#64748B] rounded-full" /> Previous
            </span>
          </div>
        </div>
        <div className="relative">
          {daily_trend.length > 0 ? (
            <div className="relative">
              <SparkLine data={daily_trend} color="#EF4444" height={80} />
              <div className="absolute inset-0 opacity-40">
                <SparkLine data={prev_daily_trend} color="#64748B" height={80} />
              </div>
            </div>
          ) : (
            <div className="h-20 flex items-center justify-center text-xs text-[#64748B]">
              No daily data available for this period
            </div>
          )}
        </div>
      </div>

      {/* Category Comparison */}
      {category_comparison.length > 0 && (
        <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#F8FAFC]">Category Breakdown</h3>
              <p className="text-[11px] text-[#94A3B8]">Change vs. previous {period === 'weekly' ? 'week' : 'month'}</p>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 text-[#EF4444]"><TrendingUp className="w-3 h-3" /> Increased</span>
              <span className="flex items-center gap-1 text-[#10B981]"><TrendingDown className="w-3 h-3" /> Reduced</span>
            </div>
          </div>
          <div className="divide-y divide-[#263449]/30">
            {displayCats.map((cat) => (
              <CategoryChangeRow key={cat.category} cat={cat} />
            ))}
          </div>
          {category_comparison.length > 5 && (
            <button
              onClick={() => setShowAllCats((v) => !v)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-[#0F172A] border border-[#263449] text-[#94A3B8] hover:text-[#F8FAFC] transition-all"
            >
              {showAllCats
                ? <><ChevronUp className="w-3.5 h-3.5" /> Show Less</>
                : <><ChevronDown className="w-3.5 h-3.5" /> Show All {category_comparison.length} Categories</>
              }
            </button>
          )}
        </div>
      )}

      {/* Current vs Previous Mini Comparison */}
      {current.category_breakdown?.length > 0 && (
        <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-5">
          <h3 className="text-sm font-bold text-[#F8FAFC] mb-4">
            Spending Distribution — <span className="text-[#94A3B8] font-normal">{current_period_label}</span>
          </h3>
          <div className="space-y-3">
            {current.category_breakdown.slice(0, 6).map((cat) => {
              const color = CATEGORY_COLORS[cat.category] || '#94A3B8';
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-[#F8FAFC] font-medium">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#64748B]">{cat.percentage}%</span>
                      <span className="text-[#F8FAFC] font-bold">{formatCurrencyCompact(cat.amount)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#0F172A] border border-[#263449] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReport;
