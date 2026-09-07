import React from 'react';

const Spinner = ({ size = 'md', color = 'primary', text = 'Loading...' }) => {
  if (size === 'sm') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium" role="status" aria-label="Loading">
        <span className={`w-2 h-2 rounded-full ${color === 'white' ? 'bg-white' : 'bg-emerald-600'}`} />
        <span>{text}</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center justify-center p-3" role="status" aria-label="Loading">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-600" />
        <span>{text}</span>
      </div>
    </div>
  );
};

export default Spinner;
