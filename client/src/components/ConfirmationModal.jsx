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
        className="fixed inset-0 bg-[#0B1220]/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-[#111C2E] border border-[#263449] rounded-xl shadow-2xl z-10 overflow-hidden p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 rounded-lg hover:bg-[#0F172A] border border-transparent hover:border-[#263449] transition-all focus:outline-none focus:ring-2 focus:ring-[#64748B]"
          disabled={loading}
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Content */}
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0 p-3 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-xl text-[#EF4444]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-grow pt-0.5">
            <h3 className="text-base font-semibold text-[#F8FAFC] leading-tight">
              {title}
            </h3>
            <p className="mt-2 text-sm text-[#94A3B8] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Actions Button Panel */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#263449]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] bg-[#0F172A] border border-[#263449] rounded-lg hover:bg-[#111C2E] transition-all"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#EF4444] hover:bg-red-600 rounded-lg shadow-md shadow-[#EF4444]/20 transition-all focus:outline-none focus:ring-2 focus:ring-[#EF4444] focus:ring-offset-2 focus:ring-offset-[#111C2E] disabled:opacity-50"
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
