import React, { useState } from 'react';
import { Store, Calendar, Tag, Layers } from 'lucide-react';

const MerchantList = ({ data = [] }) => {
  const [sortBy, setSortBy] = useState('highest_spending'); // 'highest_spending' | 'most_transactions' | 'recent'

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
        <p>No merchant spending data available for this period.</p>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => {
    if (sortBy === 'most_transactions') return b.count - a.count;
    if (sortBy === 'recent') return new Date(b.lastDate) - new Date(a.lastDate);
    return b.total - a.total;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-3">
      {/* Sort Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <span className="text-xs text-slate-500 font-medium">
          Top {sortedData.length} Merchants / Places
        </span>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setSortBy('highest_spending')}
            className={`px-2 py-1 text-[11px] font-semibold rounded ${
              sortBy === 'highest_spending'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Highest Spending
          </button>
          <button
            onClick={() => setSortBy('most_transactions')}
            className={`px-2 py-1 text-[11px] font-semibold rounded ${
              sortBy === 'most_transactions'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Most Frequency
          </button>
          <button
            onClick={() => setSortBy('recent')}
            className={`px-2 py-1 text-[11px] font-semibold rounded ${
              sortBy === 'recent'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Most Recent
          </button>
        </div>
      </div>

      {/* Merchant Cards List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {sortedData.map((m, index) => {
          const isTop = index === 0;
          return (
            <div
              key={m.merchant}
              className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs"
            >
              {/* Merchant Info */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 flex-shrink-0">
                  <Store className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 truncate">{m.merchant}</span>
                    {isTop && (
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                        Top Place
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="flex items-center gap-0.5">
                      <Layers className="w-3 h-3 text-slate-400" />
                      {m.count} order(s)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Tag className="w-3 h-3 text-slate-400" />
                      {m.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDate(m.lastDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-slate-900 text-sm">
                  ₹{m.total.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500">
                  ~₹{Math.round(m.total / Math.max(m.count, 1)).toLocaleString('en-IN')} / order
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MerchantList;
