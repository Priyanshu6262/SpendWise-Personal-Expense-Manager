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
        className="fixed inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-card shadow-modal z-10 overflow-hidden p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
          disabled={loading}
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Content */}
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-grow pt-0.5">
            <h3 className="text-base font-semibold text-slate-900 leading-tight">
              {title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-normal">
              {message}
            </p>
          </div>
        </div>

        {/* Actions Button Panel */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="app-btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="app-btn-danger"
            disabled={loading}
          >
            {loading ? <Spinner size="sm" color="white" text="Deleting..." /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
