import React, { useEffect, useState, useCallback } from 'react';
import { useTransactions } from '../context/TransactionContext';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  X,
  SlidersHorizontal,
} from 'lucide-react';
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
    // Instant debounce for typing
    const delayDebounceFn = setTimeout(() => {
      handleFetch();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [search, type, category, handleFetch]);

  // Adjust categories dropdown based on selected type
  const getCategoryOptions = useCallback(() => {
    if (type === 'Expense') return EXPENSE_CATEGORIES;
    if (type === 'Income') return INCOME_CATEGORIES;
    return ALL_CATEGORIES;
  }, [type]);

  // Keep category option valid when type switches
  useEffect(() => {
    const validCategories = getCategoryOptions();
    if (category !== 'All' && !validCategories.includes(category)) {
      setCategory('All');
    }
  }, [category, getCategoryOptions]);

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

  const clearAllFilters = () => {
    setSearch('');
    setType('All');
    setCategory('All');
  };

  const isFiltered = search !== '' || type !== 'All' || category !== 'All';

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transactions</h1>
            {!loading && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                {transactions.length}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, and manage all your income and expense records
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="app-btn-primary py-2 px-3 text-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Transaction
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="app-card p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input pl-9 pr-8"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="app-input text-xs sm:text-sm font-medium"
            >
              <option value="All">All Types</option>
              <option value="Expense">Expenses Only</option>
              <option value="Income">Income Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="app-input text-xs sm:text-sm font-medium"
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

        {/* Active Filter Indicators */}
        {isFiltered && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters active</span>
            </div>
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Transactions Table & Mobile List Card */}
      <div className="app-card overflow-hidden">
        {loading && transactions.length === 0 ? (
          <div className="p-12 flex items-center justify-center">
            <Spinner size="md" text="Loading transactions..." />
          </div>
        ) : transactions.length === 0 ? (
          /* Empty State */
          <div className="p-10 sm:p-14 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">No matching transactions</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-4">
              {isFiltered
                ? 'We could not find any transactions matching your active search query or filters.'
                : 'No transactions found. Add a transaction to start keeping track of your records.'}
            </p>
            {isFiltered ? (
              <button
                onClick={clearAllFilters}
                className="app-btn-secondary text-xs"
              >
                Reset All Filters
              </button>
            ) : (
              <button
                onClick={() => setIsFormOpen(true)}
                className="app-btn-primary text-xs"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Transaction
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Date</th>
                    <th scope="col" className="px-5 py-3.5">Title</th>
                    <th scope="col" className="px-5 py-3.5">Category</th>
                    <th scope="col" className="px-5 py-3.5">Type</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Amount</th>
                    <th scope="col" className="px-5 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50">
                      {/* Date */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(t.date)}
                        </span>
                      </td>

                      {/* Title & Notes */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 leading-tight">
                          {t.title}
                        </div>
                        {t.notes && (
                          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs" title={t.notes}>
                            {t.notes}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {t.category}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                            t.type === 'Income'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                          }`}
                        >
                          {t.type === 'Income' ? (
                            <>
                              <ArrowUpRight className="w-3 h-3" />
                              Income
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="w-3 h-3" />
                              Expense
                            </>
                          )}
                        </span>
                      </td>

                      {/* Amount */}
                      <td
                        className={`px-5 py-3.5 whitespace-nowrap text-right font-bold ${
                          t.type === 'Income' ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {t.type === 'Income' ? '+' : '-'} {formatCurrency(t.amount)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(t)}
                            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                            title="Edit transaction"
                            aria-label="Edit transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(t._id)}
                            className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 focus:outline-none focus:ring-1 focus:ring-rose-400"
                            title="Delete transaction"
                            aria-label="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="sm:hidden divide-y divide-slate-100">
              {transactions.map((t) => (
                <div key={t._id} className="p-4 space-y-2 hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                        {t.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(t.date)}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold whitespace-nowrap ${
                        t.type === 'Income' ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {t.type === 'Income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </span>
                  </div>

                  {t.notes && (
                    <p className="text-xs text-slate-500 truncate">
                      {t.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                        {t.category}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                          t.type === 'Income'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {t.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(t)}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 p-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(t._id)}
                        className="text-xs font-medium text-rose-600 hover:text-rose-700 p-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
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
