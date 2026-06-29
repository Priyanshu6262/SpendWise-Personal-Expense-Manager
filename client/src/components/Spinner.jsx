import React from 'react';

const Spinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };
  const colorClasses = {
    primary: 'border-primary border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label="loading"
      ></div>
    </div>
  );
};

export default Spinner;
