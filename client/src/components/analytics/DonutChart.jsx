import React, { useState } from 'react';

const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Shopping: '#ec4899',
  Bills: '#3b82f6',
  Travel: '#8b5cf6',
  Entertainment: '#10b981',
  Healthcare: '#ef4444',
  Education: '#06b6d4',
  Other: '#64748b',
};

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4', '#64748b'];

const DonutChart = ({ data = [], total = 0 }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
        <p>No category spending data available for this period.</p>
      </div>
    );
  }

  // Calculate SVG Pie/Donut Slices
  let accumulatedAngle = 0;
  const radius = 80;
  const cx = 100;
  const cy = 100;
  const strokeWidth = 26;

  const slices = data.map((item, index) => {
    const color = CATEGORY_COLORS[item.category] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
    const fraction = item.amount / total;
    const angle = fraction * 360;

    // Circumference
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(angle / 360) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedAngle / 360) * circumference);

    accumulatedAngle += angle;

    return {
      ...item,
      color,
      strokeDasharray,
      strokeDashoffset,
      fraction,
    };
  });

  const activeItem = activeCategory ? data.find((d) => d.category === activeCategory) : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* SVG Donut */}
      <div className="relative w-52 h-52 flex-shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {slices.map((slice) => (
            <circle
              key={slice.category}
              cx={cx}
              cy={cy}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={activeCategory === slice.category ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              onMouseEnter={() => setActiveCategory(slice.category)}
              onMouseLeave={() => setActiveCategory(null)}
              className="cursor-pointer"
            />
          ))}
        </svg>

        {/* Center Summary */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
          <span className="text-xs text-slate-500 font-medium">
            {activeItem ? activeItem.category : 'Total Spent'}
          </span>
          <span className="text-base font-bold text-slate-900 tracking-tight">
            ₹{(activeItem ? activeItem.amount : total).toLocaleString('en-IN')}
          </span>
          {activeItem && (
            <span className="text-xs font-semibold text-emerald-700">
              {activeItem.percentage}%
            </span>
          )}
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="flex-grow w-full space-y-2 max-h-56 overflow-y-auto pr-1">
        {data.map((item, index) => {
          const color = CATEGORY_COLORS[item.category] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
          const isSelected = activeCategory === item.category;

          return (
            <div
              key={item.category}
              onMouseEnter={() => setActiveCategory(item.category)}
              onMouseLeave={() => setActiveCategory(null)}
              className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer border ${
                isSelected ? 'bg-slate-100 border-slate-300' : 'bg-slate-50/60 border-transparent hover:bg-slate-50 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="font-semibold text-slate-800 truncate">{item.category}</span>
              </div>
              <div className="flex items-center gap-3 font-medium">
                <span className="text-slate-500">{item.percentage}%</span>
                <span className="font-bold text-slate-900">₹{item.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DonutChart;
