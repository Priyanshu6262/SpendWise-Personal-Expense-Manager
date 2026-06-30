import React, { useEffect, useState, useCallback } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { Search, Plus, Edit2, Trash2, Tag, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import TransactionForm from '../components/TransactionForm';
import ConfirmationModal from '../components/ConfirmationModal';
import Spinner from '../components/Spinner';

const EXPENSE_CATEGORIES = ['Food', 'Shopping', 'Bills', 'Travel', 'Entertainment', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Other'];
const ALL_CATEGORIES = [...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])];

const Transactions = () => {
  const { transactions, loading, fetchTransactions, deleteTransaction } = useTransactions();
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters state
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [category, setCategory] = useState('All');

  // Trigger search/filter fetch
  const handleFetch = useCallback(() => {
    fetchTransactions({ type, category, search });
  }, [fetchTransactions, type, category, search]);

  useEffect(() => {
    // Debounce search input or fetch instantly on filter change
    const delayDebounceFn = setTimeout(() => {
      handleFetch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, type, category, handleFetch]);

  // Adjust categories dropdown based on selected type
  const getCategoryOptions = () => {
    if (type === 'Expense') return EXPENSE_CATEGORIES;
    if (type === 'Income') return INCOME_CATEGORIES;
    return ALL_CATEGORIES;
  };

  // Keep category option valid when type switches
  useEffect(() => {
    const validCategories = getCategoryOptions();
    if (category !== 'All' && !validCategories.includes(category)) {
      setCategory('All');
    }
  }, [type]);

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingTransactionId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTransactionId) return;
    setIsDeleting(true);
    await deleteTransaction(deletingTransactionId);
    setIsDeleting(false);
    setDeletingTransactionId(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  // Helper for date formatting
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper for currency formatting
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary">Transactions</h1>
          <p className="text-sm text-textSecondary">Search, filter, and review all your financial records</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="stitch-btn-primary flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Filters Card */}
      <div className="stitch-card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-textSecondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="stitch-input pl-10"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="stitch-input"
            >
              <option value="All">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="stitch-input"
            >
              <option value="All">All Categories</option>
              {getCategoryOptions().map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table/List Card */}
      <div className="stitch-card overflow-hidden">
        {loading && transactions.length === 0 ? (
          <div className="p-12 flex items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : transactions.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="p-4 bg-bgSecondary border border-borderLight rounded-full text-textSecondary mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-textPrimary mb-1">No transactions match</h3>
            <p className="text-sm text-textSecondary max-w-sm mb-4">
              Try adjusting your search query or filters to find what you're looking for.
            </p>
            {(search || type !== 'All' || category !== 'All') && (
              <button
                onClick={() => {
                  setSearch('');
                  setType('All');
                  setCategory('All');
                }}
                className="stitch-btn-secondary"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-bgSecondary text-textSecondary font-semibold border-b border-borderLight">
                <tr>
                  <th scope="col" className="px-6 py-4">Date</th>
                  <th scope="col" className="px-6 py-4">Title</th>
                  <th scope="col" className="px-6 py-4">Category</th>
                  <th scope="col" className="px-6 py-4">Type</th>
                  <th scope="col" className="px-6 py-4 text-right">Amount</th>
                  <th scope="col" className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight/60">
                {transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-bgSecondary/30 transition-colors">
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-textSecondary font-medium">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 opacity-70" />
                        {formatDate(t.date)}
                      </span>
                    </td>
                    {/* Title */}
                    <td className="px-6 py-4 font-semibold text-textPrimary">
                      {t.title}
                    </td>
                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-borderLight text-xs font-semibold text-textSecondary bg-white">
                        <Tag className="w-3.5 h-3.5 opacity-60" />
                        {t.category}
                      </span>
                    </td>
                    {/* Type */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          t.type === 'Income'
                            ? 'bg-income-light text-income-hover'
                            : 'bg-expense-light text-expense-hover'
                        }`}
                      >
                        {t.type === 'Income' ? (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            Income
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            Expense
                          </>
                        )}
                      </span>
                    </td>
                    {/* Amount */}
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-bold text-base ${
                      t.type === 'Income' ? 'text-income-hover' : 'text-expense-hover'
                    }`}>
                      {t.type === 'Income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-2 rounded-xl text-textSecondary hover:text-secondary hover:bg-secondary-light border border-transparent hover:border-secondary/20 transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(t._id)}
                          className="p-2 rounded-xl text-textSecondary hover:text-expense hover:bg-expense-light border border-transparent hover:border-expense/20 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Edit Form Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        transaction={editingTransaction}
      />

      {/* Deletion Modal */}
      <ConfirmationModal
        isOpen={!!deletingTransactionId}
        onClose={() => setDeletingTransactionId(null)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this transaction? This updates your total balance immediately."
      />
    </div>
  );
};

export default Transactions;
