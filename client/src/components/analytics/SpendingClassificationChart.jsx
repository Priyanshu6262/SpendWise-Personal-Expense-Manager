import React from 'react';
import { ShieldCheck, Sparkles, AlertTriangle, Info } from 'lucide-react';

const SpendingClassificationChart = ({
  necessary = 0,
  discretionary = 0,
  unusual = 0,
  potentialSavings = 0,
  total = 0,
}) => {
  const necessaryPct = total > 0 ? Math.round((necessary / total) * 100) : 0;
  const discretionaryPct = total > 0 ? Math.round((discretionary / total) * 100) : 0;
  const unusualPct = total > 0 ? Math.round((unusual / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Visual Stacked Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span>Spending Distribution</span>
          <span className="text-slate-500">Total: ₹{total.toLocaleString('en-IN')}</span>
        </div>
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-600 h-full"
            style={{ width: `${necessaryPct}%` }}
            title={`Necessary: ₹${necessary.toLocaleString('en-IN')} (${necessaryPct}%)`}
          />
          <div
            className="bg-amber-500 h-full"
            style={{ width: `${discretionaryPct}%` }}
            title={`Discretionary: ₹${discretionary.toLocaleString('en-IN')} (${discretionaryPct}%)`}
          />
          {unusualPct > 0 && (
            <div
              className="bg-rose-500 h-full"
              style={{ width: `${unusualPct}%` }}
              title={`Unusual: ₹${unusual.toLocaleString('en-IN')} (${unusualPct}%)`}
            />
          )}
        </div>
      </div>

      {/* Breakdown Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Necessary Spending */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Necessary & Essential</span>
          </div>
          <div className="text-base font-bold text-slate-900">
            ₹{necessary.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            {necessaryPct}% of spending (Bills, Food, Healthcare)
          </span>
        </div>

        {/* Discretionary Spending */}
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold mb-1">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Discretionary / Lifestyle</span>
          </div>
          <div className="text-base font-bold text-slate-900">
            ₹{discretionary.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-amber-700 font-medium">
            {discretionaryPct}% of spending (Shopping, Fun, Travel)
          </span>
        </div>

        {/* Potential Savings */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-1.5 text-slate-800 text-xs font-bold mb-1">
            <AlertTriangle className="w-4 h-4 text-slate-600" />
            <span>Target Savings Potential</span>
          </div>
          <div className="text-base font-bold text-emerald-700">
            ~₹{potentialSavings.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Estimated 25% optimization opportunity
          </span>
        </div>
      </div>

      {/* AI Classification Disclaimer Notice */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2 text-[11px] text-slate-600">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Note on AI Classifications:</strong> Categories and necessary vs. discretionary labels are automated heuristics based on merchant types and historical patterns. They are intended as <em>guidelines for budgeting</em> rather than absolute financial judgments.
        </p>
      </div>
    </div>
  );
};

export default SpendingClassificationChart;
