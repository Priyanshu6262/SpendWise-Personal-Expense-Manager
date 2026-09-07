import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTransactions } from '../context/TransactionContext';
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import TransactionForm from '../components/TransactionForm';
import ConfirmationModal from '../components/ConfirmationModal';
import Spinner from '../components/Spinner';

const Dashboard = () => {
  const { transactions, loading, fetchTransactions, deleteTransaction } = useTransactions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpense;
  const recentTransactions = transactions.slice(0, 5);

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
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finance Overview</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time snapshot of your income, expenses, and current balance
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchTransactions()}
            className="app-btn-secondary py-2 px-3 text-xs"
            title="Refresh Transactions"
            disabled={loading}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="app-btn-primary py-2 px-3 text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Balance Card */}
        <div className="app-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Balance
            </span>
            <div className={`p-2 rounded-lg ${totalBalance >= 0 ? 'bg-slate-100 text-slate-700' : 'bg-rose-50 text-rose-600'}`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${totalBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              {totalBalance >= 0 ? (
                <span className="text-emerald-700 font-medium flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" /> Net Positive
                </span>
              ) : (
                <span className="text-rose-600 font-medium flex items-center">
                  <TrendingDown className="w-3.5 h-3.5 mr-1" /> Deficit
                </span>
              )}
              <span className="text-slate-400">across all records</span>
            </p>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="app-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Income
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-700">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {transactions.filter((t) => t.type === 'Income').length} income source(s) recorded
            </p>
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="app-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-600">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {transactions.filter((t) => t.type === 'Expense').length} expense item(s) logged
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
            <p className="text-xs text-slate-500">Your latest transactions at a glance</p>
          </div>
          {transactions.length > 0 && (
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              View all ({transactions.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading && transactions.length === 0 ? (
          <div className="app-card p-12 flex items-center justify-center">
            <Spinner size="md" text="Loading recent activity..." />
          </div>
        ) : transactions.length === 0 ? (
          /* Empty State Container */
          <div className="app-card p-10 sm:p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">No transactions recorded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-5">
              Start tracking your income and expenses to see detailed activity and statistics here.
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="app-btn-primary text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Your First Transaction
            </button>
          </div>
        ) : (
          <div className="app-card divide-y divide-slate-100 overflow-hidden">
            {recentTransactions.map((t) => (
              <div
                key={t._id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-slate-50"
              >
                {/* Left Info */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                      t.type === 'Income'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                        : 'bg-rose-50 text-rose-600 border border-rose-200/50'
                    }`}
                  >
                    {t.type === 'Income' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">
                      {t.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {t.category}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDate(t.date)}
                      </span>
                      {t.notes && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline text-slate-400 truncate max-w-[200px]" title={t.notes}>
                            {t.notes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <span
                    className={`text-sm sm:text-base font-bold whitespace-nowrap ${
                      t.type === 'Income' ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {t.type === 'Income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(t)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      title="Edit transaction"
                      aria-label="Edit transaction"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(t._id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 focus:outline-none focus:ring-1 focus:ring-rose-400"
                      title="Delete transaction"
                      aria-label="Delete transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Add/Edit Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        transaction={editingTransaction}
      />

      {/* Deletion Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingTransactionId}
        onClose={() => setDeletingTransactionId(null)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        title="Delete Transaction"
        message="Are you sure you want to permanently remove this transaction? This updates your total balance immediately."
      />
    </div>
  );
};

export default Dashboard;
