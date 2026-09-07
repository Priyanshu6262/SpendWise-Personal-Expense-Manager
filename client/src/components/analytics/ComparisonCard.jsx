import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const ComparisonCard = ({
  currentTotal = 0,
  prevTotal = 0,
  delta = 0,
  deltaPct = 0,
  categoryBreakdown = [],
}) => {
  const isIncrease = delta > 0;
  const isDecrease = delta < 0;

  // Find top categories contributing to the increase or decrease
  const shiftedCategories = [...categoryBreakdown]
    .filter((c) => c.prevAmount > 0 || c.amount > 0)
    .sort((a, b) => Math.abs(b.amount - b.prevAmount) - Math.abs(a.amount - a.prevAmount))
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* High Level Period Comparison Numbers */}
      <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Current Period
          </span>
          <div className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            ₹{currentTotal.toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Prior Period
          </span>
          <div className="text-lg sm:text-xl font-bold text-slate-600 mt-0.5">
            ₹{prevTotal.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Delta Badge & Explanation */}
      <div className="flex items-center justify-between p-3 rounded-lg border text-xs">
        <div className="flex items-center gap-2">
          {isIncrease ? (
            <div className="p-1 rounded bg-rose-100 text-rose-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          ) : isDecrease ? (
            <div className="p-1 rounded bg-emerald-100 text-emerald-700">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1 rounded bg-slate-100 text-slate-700">
              <Minus className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="font-bold text-slate-900">
              {isIncrease ? `+₹${Math.abs(delta).toLocaleString('en-IN')} (+${deltaPct}%)` : isDecrease ? `-₹${Math.abs(delta).toLocaleString('en-IN')} (${deltaPct}%)` : 'No Change'}
            </div>
            <span className="text-slate-500 text-[11px]">
              {isIncrease ? 'Spending is higher than previous period' : isDecrease ? 'Spending decreased compared to prior period' : 'Spending is even'}
            </span>
          </div>
        </div>
      </div>

      {/* Category Contributors */}
      <div>
        <h4 className="text-xs font-bold text-slate-900 mb-2">Key Category Drivers</h4>
        <div className="space-y-1.5">
          {shiftedCategories.map((c) => {
            const catDiff = c.amount - c.prevAmount;
            const diffSign = catDiff > 0 ? '+' : '';
            return (
              <div
                key={c.category}
                className="flex items-center justify-between p-2 rounded bg-slate-50 text-xs border border-slate-100"
              >
                <span className="font-semibold text-slate-800">{c.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">₹{c.amount.toLocaleString('en-IN')}</span>
                  <span
                    className={`font-bold text-[11px] ${
                      catDiff > 0 ? 'text-rose-600' : catDiff < 0 ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    {diffSign}₹{Math.abs(catDiff).toLocaleString('en-IN')} ({c.changePct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ComparisonCard;
