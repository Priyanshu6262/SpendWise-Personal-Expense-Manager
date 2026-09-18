import React, { useState, useEffect } from 'react';
import { X, IndianRupee } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import Spinner from './Spinner';

const EXPENSE_CATEGORIES = ['Food', 'Shopping', 'Bills', 'Travel', 'Entertainment', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Other'];

const TransactionForm = ({ isOpen, onClose, transaction = null }) => {
  const { addTransaction, updateTransaction } = useTransactions();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'Expense',
    category: EXPENSE_CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (transaction) {
      setFormData({
        title: transaction.title || '',
        amount: transaction.amount || '',
        type: transaction.type || 'Expense',
        category:
          transaction.category ||
          (transaction.type === 'Income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]),
        date: transaction.date
          ? new Date(transaction.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        notes: transaction.notes || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        type: 'Expense',
        category: EXPENSE_CATEGORIES[0],
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [transaction, isOpen]);

  // Handle Type Toggle button
  const handleTypeSelect = (newType) => {
    const defaultCategory = newType === 'Expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0];
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: defaultCategory,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.date || !formData.category) {
      return;
    }

    setLoading(true);
    const amountNum = parseFloat(formData.amount);
    const data = { ...formData, amount: amountNum };

    let success = false;
    if (transaction) {
      success = await updateTransaction(transaction._id, data);
    } else {
      success = await addTransaction(data);
    }

    setLoading(false);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const categories = formData.type === 'Expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B1220]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Form Container Card */}
      <div className="relative w-full max-w-lg bg-[#111C2E] border border-[#263449] rounded-xl shadow-2xl z-10 overflow-hidden p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#263449] pb-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#F8FAFC]">
              {transaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {transaction
                ? 'Update the details for this transaction record.'
                : 'Enter transaction details to track in your account.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 rounded-lg hover:bg-[#0F172A] border border-transparent hover:border-[#263449] transition-all focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            disabled={loading}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type Segmented Toggle */}
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#0F172A] rounded-lg border border-[#263449]">
              <button
                type="button"
                onClick={() => handleTypeSelect('Expense')}
                className={`py-2 text-xs font-bold rounded-md transition-all focus:outline-none ${
                  formData.type === 'Expense'
                    ? 'bg-[#EF4444] text-white shadow-md shadow-[#EF4444]/20'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeSelect('Income')}
                className={`py-2 text-xs font-bold rounded-md transition-all focus:outline-none ${
                  formData.type === 'Income'
                    ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/20'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Title Field */}
          <div>
            <label
              htmlFor="title"
              className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5"
            >
              Title <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Grocery Shopping, Monthly Salary"
              className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-[#263449] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all disabled:opacity-50"
              required
              disabled={loading}
            />
          </div>

          {/* Amount and Category Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5"
              >
                Amount (₹) <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#0F172A] border border-[#263449] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all disabled:opacity-50"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5"
              >
                Category <span className="text-[#EF4444]">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-[#263449] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all disabled:opacity-50"
                required
                disabled={loading}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0F172A] text-[#F8FAFC]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Field */}
          <div>
            <label
              htmlFor="date"
              className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5"
            >
              Date <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-[#263449] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all disabled:opacity-50 [color-scheme:dark]"
              required
              disabled={loading}
            />
          </div>

          {/* Notes Field */}
          <div>
            <label
              htmlFor="notes"
              className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5"
            >
              Notes <span className="text-[#64748B] lowercase font-normal">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional details or reference notes..."
              rows="3"
              className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-[#263449] rounded-lg text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all resize-none disabled:opacity-50"
              disabled={loading}
            />
          </div>

          {/* Footer Actions */}
          <div className="border-t border-[#263449] pt-4 mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] bg-[#0F172A] border border-[#263449] rounded-lg hover:bg-[#111C2E] transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#10B981] hover:bg-[#059669] rounded-lg shadow-md shadow-[#10B981]/20 transition-all focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 focus:ring-offset-[#111C2E] disabled:opacity-50"
              disabled={loading || !formData.title || !formData.amount}
            >
              {loading ? (
                <Spinner size="sm" color="white" text="Saving..." />
              ) : transaction ? (
                'Save Changes'
              ) : (
                'Add Transaction'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
