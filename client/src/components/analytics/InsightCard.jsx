import React, { useState } from 'react';
import {
  AlertCircle,
  Repeat,
  CheckCircle2,
  PiggyBank,
  ChevronRight,
  X,
  Calendar,
  Tag,
} from 'lucide-react';

const InsightCard = ({ insight }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!insight) return null;

  const { type, tag, title, description, supportingData = [] } = insight;

  // Icon & Style Mapping
  const typeConfig = {
    unusual: {
      border: 'border-rose-200 bg-rose-50/50',
      tagBadge: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
    },
    repeated: {
      border: 'border-amber-200 bg-amber-50/50',
      tagBadge: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <Repeat className="w-4 h-4 text-amber-600" />,
    },
    good: {
      border: 'border-emerald-200 bg-emerald-50/50',
      tagBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    },
    saving: {
      border: 'border-blue-200 bg-blue-50/50',
      tagBadge: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <PiggyBank className="w-4 h-4 text-blue-600" />,
    },
  };

  const config = typeConfig[type] || typeConfig.good;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <div className={`p-4 rounded-lg border ${config.border} flex flex-col justify-between`}>
        <div>
          {/* Tag & Icon Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border ${config.tagBadge}`}>
              {config.icon}
              {tag}
            </span>
          </div>

          {/* Title & Body */}
          <h4 className="text-sm font-bold text-slate-900 leading-tight">
            {title}
          </h4>
          <p className="text-xs text-slate-600 mt-1 leading-normal">
            {description}
          </p>
        </div>

        {/* Why / View Data Trigger */}
        {supportingData.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline"
            >
              Why this insight? ({supportingData.length} records)
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Supporting Data Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-card shadow-modal z-10 overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${config.tagBadge}`}>
                  {tag}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{title}</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-normal">
              {description}
            </p>

            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Supporting Transaction Evidence
            </h4>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {supportingData.map((t) => (
                <div
                  key={t._id || t.id || Math.random()}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{t.title}</div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {t.category}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDate(t.date)}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{t.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="app-btn-secondary text-xs py-1.5 px-3"
              >
                Close Data View
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InsightCard;
