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
        category: transaction.category || (transaction.type === 'Income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]),
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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
        className="fixed inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Form Container Card */}
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-card shadow-modal z-10 overflow-hidden p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {transaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {transaction ? 'Update the details for this transaction record.' : 'Enter transaction details to track in your account.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
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
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => handleTypeSelect('Expense')}
                className={`py-2 text-xs font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  formData.type === 'Expense'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeSelect('Income')}
                className={`py-2 text-xs font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  formData.type === 'Income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Grocery Shopping, Monthly Salary"
              className="app-input"
              required
              disabled={loading}
            />
          </div>

          {/* Amount and Category Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="app-input pl-9"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="app-input"
                required
                disabled={loading}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Field */}
          <div>
            <label htmlFor="date" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="app-input"
              required
              disabled={loading}
            />
          </div>

          {/* Notes Field */}
          <div>
            <label htmlFor="notes" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes <span className="text-slate-400 lowercase font-normal">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional details or reference notes..."
              rows="3"
              className="app-input resize-none"
              disabled={loading}
            />
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="app-btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="app-btn-primary"
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
