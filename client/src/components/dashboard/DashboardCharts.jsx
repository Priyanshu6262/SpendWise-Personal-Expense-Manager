import React, { useState, useMemo } from 'react';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

// Harmonious category colors for dark theme
const CATEGORY_COLORS = {
  Food: '#F59E0B',          // Warning Amber
  Shopping: '#EC4899',      // Modern Pink
  Bills: '#6366F1',         // AI Purple
  Travel: '#06B6D4',        // Cyan
  Entertainment: '#8B5CF6', // Indigo/Violet
  Healthcare: '#EF4444',    // Red
  Education: '#3B82F6',     // Blue
  Other: '#10B981',         // Primary Green
};

const DEFAULT_BUDGETS = {
  Food: 15000,
  Shopping: 10000,
  Bills: 12000,
  Travel: 8000,
  Entertainment: 5000,
  Healthcare: 6000,
  Education: 8000,
  Other: 5000,
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/* ─────────────────────────────────────────────────────────────
   1. Category Expense Donut / Pie Chart Component
   ───────────────────────────────────────────────────────────── */
const CategoryDonutChart = ({ transactions }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const { categoryData, totalExpense } = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'Expense');
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);

    const map = {};
    expenses.forEach((t) => {
      const cat = t.category || 'Other';
      map[cat] = (map[cat] || 0) + t.amount;
    });

    const sorted = Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        color: CATEGORY_COLORS[category] || '#94A3B8',
      }))
      .sort((a, b) => b.amount - a.amount);

    return { categoryData: sorted, totalExpense: total };
  }, [transactions]);

  if (categoryData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-4">
        <div className="w-12 h-12 rounded-full bg-[#0F172A] border border-[#263449] flex items-center justify-center text-[#94A3B8] mb-2">
          <PieIcon className="w-6 h-6 text-[#64748B]" />
        </div>
        <p className="text-xs text-[#94A3B8]">No expense data recorded yet</p>
      </div>
    );
  }

  // SVG Donut Calculation
  let cumulativeAngle = 0;
  const radius = 70;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  const slices = categoryData.map((item) => {
    const fraction = totalExpense > 0 ? item.amount / totalExpense : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeAngle * circumference;
    cumulativeAngle += fraction;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeItem = hoveredCategory
    ? categoryData.find((c) => c.category === hoveredCategory)
    : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="transparent"
            stroke="#0F172A"
            strokeWidth={strokeWidth}
          />
          {slices.map((slice) => (
            <circle
              key={slice.category}
              cx="90"
              cy="90"
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={hoveredCategory === slice.category ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              onMouseEnter={() => setHoveredCategory(slice.category)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="transition-all duration-300 cursor-pointer"
            />
          ))}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
          <span className="text-[11px] font-medium text-[#94A3B8] truncate max-w-[100px]">
            {activeItem ? activeItem.category : 'Total Expense'}
          </span>
          <span className="text-sm font-bold text-[#F8FAFC]">
            {formatCurrency(activeItem ? activeItem.amount : totalExpense)}
          </span>
          {activeItem && (
            <span className="text-[11px] font-bold text-[#10B981]">
              {activeItem.percentage}%
            </span>
          )}
        </div>
      </div>

      {/* Breakdown List */}
      <div className="flex-1 w-full space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
        {categoryData.map((item) => {
          const isSelected = hoveredCategory === item.category;
          return (
            <div
              key={item.category}
              onMouseEnter={() => setHoveredCategory(item.category)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer border transition-all ${
                isSelected
                  ? 'bg-[#0F172A] border-[#10B981]/50'
                  : 'bg-[#0F172A]/40 border-transparent hover:bg-[#0F172A] hover:border-[#263449]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-[#F8FAFC] truncate">{item.category}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <span className="text-[#64748B] text-[11px]">{item.percentage}%</span>
                <span className="text-[#F8FAFC] font-bold">{formatCurrency(item.amount)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   2. Monthly Income vs Expenses Bar Chart Component
   ───────────────────────────────────────────────────────────── */
const MonthlyBarChart = ({ transactions }) => {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  const monthlyData = useMemo(() => {
    const monthsMap = {};
    const now = new Date();

    // Initialize last 6 months in chronological order
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString(undefined, { month: 'short' });
      monthsMap[key] = { key, label, income: 0, expense: 0 };
    }

    transactions.forEach((t) => {
      if (!t.date) return;
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthsMap[key]) {
        if (t.type === 'Income') {
          monthsMap[key].income += t.amount;
        } else if (t.type === 'Expense') {
          monthsMap[key].expense += t.amount;
        }
      }
    });

    return Object.values(monthsMap);
  }, [transactions]);

  const maxVal = Math.max(
    ...monthlyData.map((m) => Math.max(m.income, m.expense)),
    1000
  );

  return (
    <div className="space-y-4">
      {/* Legend & Stats */}
      <div className="flex items-center justify-between text-xs pb-2 border-b border-[#263449]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-[#10B981] font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]"></span> Income
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#EF4444] font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]"></span> Expenses
          </span>
        </div>
        <span className="text-[#64748B] text-[11px]">Past 6 Months</span>
      </div>

      {/* Bars Container */}
      <div className="h-44 flex items-end justify-between gap-3 pt-6 px-1">
        {monthlyData.map((m) => {
          const incHeight = Math.max(Math.round((m.income / maxVal) * 100), 4);
          const expHeight = Math.max(Math.round((m.expense / maxVal) * 100), 4);
          const isHovered = hoveredMonth === m.key;

          return (
            <div
              key={m.key}
              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              onMouseEnter={() => setHoveredMonth(m.key)}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-14 bg-[#0B1220] border border-[#263449] rounded-lg p-2 shadow-xl z-20 whitespace-nowrap text-left text-[11px] pointer-events-none">
                  <p className="font-bold text-[#F8FAFC]">{m.label}</p>
                  <p className="text-[#10B981]">Income: {formatCurrency(m.income)}</p>
                  <p className="text-[#EF4444]">Expense: {formatCurrency(m.expense)}</p>
                </div>
              )}

              {/* Side by side bars */}
              <div className="flex items-end gap-1 w-full justify-center h-full pb-1">
                {/* Income Bar */}
                <div
                  className="w-3.5 sm:w-5 bg-[#10B981]/80 hover:bg-[#10B981] rounded-t transition-all"
                  style={{ height: `${incHeight}%` }}
                />
                {/* Expense Bar */}
                <div
                  className="w-3.5 sm:w-5 bg-[#EF4444]/80 hover:bg-[#EF4444] rounded-t transition-all"
                  style={{ height: `${expHeight}%` }}
                />
              </div>

              {/* Month Label */}
              <span className={`text-[11px] font-semibold mt-1 transition-colors ${
                isHovered ? 'text-[#F8FAFC]' : 'text-[#94A3B8]'
              }`}>
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   3. Spending Trend Line Chart Component
   ───────────────────────────────────────────────────────────── */
const SpendingTrendLineChart = ({ transactions }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const trendPoints = useMemo(() => {
    const expenses = transactions
      .filter((t) => t.type === 'Expense' && t.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (expenses.length === 0) return [];

    // Group by date
    const dailyMap = {};
    expenses.forEach((t) => {
      const dStr = new Date(t.date).toISOString().split('T')[0];
      dailyMap[dStr] = (dailyMap[dStr] || 0) + t.amount;
    });

    const entries = Object.entries(dailyMap).map(([date, amount]) => ({
      date,
      formattedDate: new Date(date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
      amount,
    }));

    // Take up to the last 10 entries for a clean graph
    return entries.slice(-10);
  }, [transactions]);

  if (trendPoints.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-4">
        <div className="w-12 h-12 rounded-full bg-[#0F172A] border border-[#263449] flex items-center justify-center text-[#94A3B8] mb-2">
          <TrendingUp className="w-6 h-6 text-[#64748B]" />
        </div>
        <p className="text-xs text-[#94A3B8]">No spending trajectory points to plot</p>
      </div>
    );
  }

  const maxAmount = Math.max(...trendPoints.map((p) => p.amount), 1);
  const minAmount = Math.min(...trendPoints.map((p) => p.amount));
  const avgAmount = Math.round(
    trendPoints.reduce((sum, p) => sum + p.amount, 0) / trendPoints.length
  );

  // SVG Dimensions & Path Calculation
  const width = 450;
  const height = 150;
  const paddingX = 25;
  const paddingY = 20;

  const getCoordinates = (index, amount) => {
    const x =
      paddingX +
      (index / Math.max(trendPoints.length - 1, 1)) * (width - 2 * paddingX);
    const y =
      height -
      paddingY -
      ((amount - minAmount) / Math.max(maxAmount - minAmount, 1)) *
        (height - 2 * paddingY);
    return { x, y };
  };

  const points = trendPoints.map((p, idx) => getCoordinates(idx, p.amount));

  // Build SVG Path (smooth or line)
  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  // Fill area path for the gradient
  const areaD = `${pathD} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  return (
    <div className="space-y-4">
      {/* Header Metric Stats */}
      <div className="flex items-center justify-between text-xs pb-2 border-b border-[#263449]">
        <div className="flex items-center gap-3">
          <span className="text-[#94A3B8]">
            Avg/Day: <strong className="text-[#F8FAFC]">{formatCurrency(avgAmount)}</strong>
          </span>
          <span className="text-[#64748B]">•</span>
          <span className="text-[#94A3B8]">
            Peak: <strong className="text-[#EF4444]">{formatCurrency(maxAmount)}</strong>
          </span>
        </div>
        <span className="text-[#6366F1] font-semibold text-xs flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" /> Spending Trajectory
        </span>
      </div>

      {/* SVG Chart */}
      <div className="relative h-44 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          <line
            x1="0"
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke="#263449"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1={height - paddingY}
            x2={width}
            y2={height - paddingY}
            stroke="#263449"
          />

          {/* Area Fill */}
          <path d={areaD} fill="url(#trendGradient)" />

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#6366F1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#10B981' : '#6366F1'}
                  stroke="#0B1220"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute -top-10 bg-[#0B1220] border border-[#263449] px-2.5 py-1 rounded-lg text-xs shadow-xl pointer-events-none transform -translate-x-1/2 z-20 whitespace-nowrap"
            style={{
              left: `${(hoveredIndex / Math.max(trendPoints.length - 1, 1)) * 100}%`,
            }}
          >
            <span className="text-[#94A3B8] font-medium mr-1.5">
              {trendPoints[hoveredIndex].formattedDate}:
            </span>
            <span className="text-[#F8FAFC] font-bold">
              {formatCurrency(trendPoints[hoveredIndex].amount)}
            </span>
          </div>
        )}

        {/* Date Labels on X Axis */}
        <div className="flex justify-between text-[10px] text-[#64748B] pt-1">
          <span>{trendPoints[0]?.formattedDate}</span>
          {trendPoints.length > 2 && (
            <span>{trendPoints[Math.floor(trendPoints.length / 2)]?.formattedDate}</span>
          )}
          <span>{trendPoints[trendPoints.length - 1]?.formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   4. Budget Usage Progress Bars Component
   ───────────────────────────────────────────────────────────── */
const BudgetUsageProgress = ({ transactions }) => {
  const budgetData = useMemo(() => {
    // Current month expenses
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthExpenses = transactions.filter((t) => {
      if (t.type !== 'Expense' || !t.date) return false;
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const categorySpend = {};
    currentMonthExpenses.forEach((t) => {
      const cat = t.category || 'Other';
      categorySpend[cat] = (categorySpend[cat] || 0) + t.amount;
    });

    // Merge with known categories
    return Object.entries(DEFAULT_BUDGETS).map(([category, budget]) => {
      const spent = categorySpend[category] || 0;
      const percentage = Math.round((spent / budget) * 100);
      return {
        category,
        budget,
        spent,
        percentage,
        remaining: budget - spent,
      };
    });
  }, [transactions]);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between text-xs pb-2 border-b border-[#263449]">
        <span className="text-[#94A3B8]">Category Limits vs. Monthly Spend</span>
        <span className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Auto-tracked
        </span>
      </div>

      <div className="space-y-3 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
        {budgetData.map((b) => {
          const isOver = b.percentage >= 100;
          const isWarning = b.percentage >= 75 && !isOver;

          const barColor = isOver
            ? 'bg-[#EF4444]'
            : isWarning
            ? 'bg-[#F59E0B]'
            : 'bg-[#10B981]';

          return (
            <div key={b.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-[#F8FAFC]">
                  <span>{b.category}</span>
                  {isOver && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40">
                      Over Cap
                    </span>
                  )}
                </div>
                <div className="text-[11px]">
                  <span className="font-bold text-[#F8FAFC]">{formatCurrency(b.spent)}</span>
                  <span className="text-[#64748B]"> / {formatCurrency(b.budget)}</span>
                  <span
                    className={`ml-1.5 font-semibold ${
                      isOver ? 'text-[#EF4444]' : isWarning ? 'text-[#F59E0B]' : 'text-[#10B981]'
                    }`}
                  >
                    ({b.percentage}%)
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-[#0F172A] border border-[#263449] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.min(100, b.percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Main DashboardCharts Wrapper Section
   ───────────────────────────────────────────────────────────── */
const DashboardCharts = ({ transactions = [] }) => {
  return (
    <div className="space-y-5 pt-2">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC]">
              Financial Visualizations & Charts
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/30">
              Interactive
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Category breakdowns, monthly balance comparison, trajectory trends, and budget tracking
          </p>
        </div>
      </div>

      {/* Grid: 4 Chart Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Category Expense Donut Chart */}
        <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-5 shadow-sm hover:border-[#263449]/90 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">Category-Wise Expenses</h3>
                <p className="text-[11px] text-[#94A3B8]">Distribution across spending segments</p>
              </div>
            </div>
          </div>
          <CategoryDonutChart transactions={transactions} />
        </div>

        {/* 2. Monthly Income vs Expenses Bar Chart */}
        <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-5 shadow-sm hover:border-[#263449]/90 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">Monthly Cash Flow (Income vs. Expense)</h3>
                <p className="text-[11px] text-[#94A3B8]">Side-by-side volume comparisons</p>
              </div>
            </div>
          </div>
          <MonthlyBarChart transactions={transactions} />
        </div>

        {/* 3. Spending Trend Line Chart */}
        <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-5 shadow-sm hover:border-[#263449]/90 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/30">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">Spending Trajectory & Trend</h3>
                <p className="text-[11px] text-[#94A3B8]">Daily/interval expenditure trajectory</p>
              </div>
            </div>
          </div>
          <SpendingTrendLineChart transactions={transactions} />
        </div>

        {/* 4. Budget Usage Progress Bars */}
        <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-5 shadow-sm hover:border-[#263449]/90 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">Budget Usage & Caps</h3>
                <p className="text-[11px] text-[#94A3B8]">Target consumption and limits for this month</p>
              </div>
            </div>
          </div>
          <BudgetUsageProgress transactions={transactions} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
