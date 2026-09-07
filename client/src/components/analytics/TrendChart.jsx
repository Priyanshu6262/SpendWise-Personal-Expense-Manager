import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TrendChart = ({ data = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
        <p>No historical trend data available yet.</p>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);
  const minAmount = Math.min(...data.map((d) => d.amount));
  const avgAmount = Math.round(data.reduce((s, d) => s + d.amount, 0) / data.length);

  // Determine Overall Trend Direction
  const first = data[0]?.amount || 0;
  const last = data[data.length - 1]?.amount || 0;
  const trendDiff = last - first;
  const trendPct = first > 0 ? Math.round((trendDiff / first) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Trend Overview Header */}
      <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {trendDiff > 0 ? (
            <span className="inline-flex items-center gap-1 font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/50">
              <TrendingUp className="w-3.5 h-3.5" /> +{trendPct}% Trajectory
            </span>
          ) : trendDiff < 0 ? (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
              <TrendingDown className="w-3.5 h-3.5" /> {trendPct}% Trajectory
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              <Minus className="w-3.5 h-3.5" /> Stable Trajectory
            </span>
          )}
          <span className="text-slate-500">across {data.length} recorded intervals</span>
        </div>
        <div className="text-slate-500">
          Monthly Avg: <strong className="text-slate-800">₹{avgAmount.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      {/* SVG Bar / Area Visualization */}
      <div className="relative h-44 flex items-end justify-between gap-2 pt-6">
        {data.map((item, index) => {
          const heightPct = Math.max(Math.round((item.amount / maxAmount) * 100), 8);
          const isHighest = item.amount === maxAmount;
          const isLowest = item.amount === minAmount && data.length > 1;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.label || index}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip on Hover */}
              <div
                className={`mb-1 text-[11px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-10 ${
                  isHovered || isHighest
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 bg-slate-100 opacity-0 group-hover:opacity-100'
                }`}
              >
                ₹{item.amount.toLocaleString('en-IN')}
              </div>

              {/* Bar Fill */}
              <div
                className={`w-full max-w-[48px] rounded-t-md ${
                  isHovered
                    ? 'bg-emerald-700'
                    : isHighest
                    ? 'bg-rose-500'
                    : isLowest
                    ? 'bg-emerald-500'
                    : 'bg-slate-300 group-hover:bg-slate-400'
                }`}
                style={{ height: `${heightPct}%` }}
              />

              {/* Label */}
              <span className="mt-2 text-[11px] font-semibold text-slate-600 truncate max-w-full">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrendChart;
