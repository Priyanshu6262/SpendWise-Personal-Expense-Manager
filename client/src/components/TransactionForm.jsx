import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
        category: transaction.category || '',
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: transaction.notes || '',
      });
    } else {
      // Default reset
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

  // Sync category when type changes
  const handleTypeChange = (e) => {
    const newType = e.target.value;
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
        className="fixed inset-0 bg-textPrimary/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Form Container Card */}
      <div className="relative w-full max-w-lg bg-white border border-borderLight rounded-2xl shadow-stitch-lg z-10 overflow-hidden animate-slide-in p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-borderLight pb-4 mb-5">
          <h2 className="text-lg font-bold text-textPrimary">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-textSecondary hover:text-textPrimary transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Weekly Groceries"
              className="stitch-input"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1.5">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="stitch-input"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1.5">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleTypeChange}
                className="stitch-input"
                required
                disabled={loading}
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="stitch-input"
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

            <div>
              <label htmlFor="date" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="stitch-input"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1.5">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add extra details here..."
              rows="3"
              className="stitch-input resize-none"
              disabled={loading}
            />
          </div>

          {/* Footer Actions */}
          <div className="border-t border-borderLight pt-4 mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="stitch-btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="stitch-btn-primary flex items-center gap-1.5"
              disabled={loading || !formData.title || !formData.amount}
            >
              {loading ? <Spinner size="sm" color="white" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
