import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Spinner from './Spinner';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Confirmation',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-textPrimary/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-white border border-borderLight rounded-2xl shadow-stitch-lg z-10 overflow-hidden animate-slide-in p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-textSecondary hover:text-textPrimary transition-colors"
          disabled={loading}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0 p-3 bg-expense-light rounded-xl text-expense">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-grow">
            <h3 className="text-base font-semibold text-textPrimary leading-6">
              {title}
            </h3>
            <p className="mt-2 text-sm text-textSecondary leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Actions Button Panel */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="stitch-btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="stitch-btn-danger flex items-center gap-1.5"
            disabled={loading}
          >
            {loading ? <Spinner size="sm" color="white" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
