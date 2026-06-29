import React, { useEffect, useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { Plus, ArrowUpRight, ArrowDownRight, Wallet, Edit2, Trash2, Calendar, Tag, RefreshCcw } from 'lucide-react';
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

  // Helper for date formatting
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper for currency formatting
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Welcome header with quick add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary">Finance Overview</h1>
          <p className="text-sm text-textSecondary">Keep track of your income and expenses in real-time</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="stitch-btn-primary flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <div className="stitch-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Total Balance</span>
            <div className={`text-2xl font-bold tracking-tight ${totalBalance >= 0 ? 'text-textPrimary' : 'text-expense'}`}>
              {formatCurrency(totalBalance)}
            </div>
          </div>
          <div className={`p-3.5 rounded-2xl ${totalBalance >= 0 ? 'bg-primary/10 text-primary' : 'bg-expense/10 text-expense'}`}>
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Total Income Card */}
        <div className="stitch-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Total Income</span>
            <div className="text-2xl font-bold tracking-tight text-income-hover">
              {formatCurrency(totalIncome)}
            </div>
          </div>
          <div className="p-3.5 bg-income-light text-income-hover rounded-2xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="stitch-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Total Expenses</span>
            <div className="text-2xl font-bold tracking-tight text-expense-hover">
              {formatCurrency(totalExpense)}
            </div>
          </div>
          <div className="p-3.5 bg-expense-light text-expense-hover rounded-2xl">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions Column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-textPrimary">Recent Activity</h2>
            <button
              onClick={() => fetchTransactions()}
              className="p-2 rounded-lg border border-borderLight text-textSecondary hover:text-textPrimary bg-white hover:bg-bgSecondary transition-colors"
              title="Refresh Transactions"
              disabled={loading}
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading && transactions.length === 0 ? (
            <div className="stitch-card p-12 flex items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : transactions.length === 0 ? (
            /* Empty State Container */
            <div className="stitch-card p-12 text-center flex flex-col items-center justify-center">
              <div className="p-4 bg-bgSecondary border border-borderLight rounded-full text-textSecondary mb-4">
                <Wallet className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-textPrimary mb-1">No transactions found</h3>
              <p className="text-sm text-textSecondary max-w-sm mb-6">
                You haven't recorded any income or expenses yet. Let's add your first transaction!
              </p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="stitch-btn-primary flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {recentTransactions.map((t) => (
                <div
                  key={t._id}
                  className="stitch-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Arrow Indicator */}
                    <div
                      className={`p-2.5 rounded-xl ${
                        t.type === 'Income'
                          ? 'bg-income-light text-income-hover'
                          : 'bg-expense-light text-expense-hover'
                      }`}
                    >
                      {t.type === 'Income' ? (
                        <ArrowUpRight className="w-4.5 h-4.5" />
                      ) : (
                        <ArrowDownRight className="w-4.5 h-4.5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-textPrimary leading-tight">
                        {t.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-xs text-textSecondary font-medium">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          {t.category}
                        </span>
                        <span className="w-1 h-1 bg-borderLight rounded-full hidden sm:inline" />
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(t.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 border-borderLight/40 pt-3 sm:pt-0">
                    <span
                      className={`text-base font-bold ${
                        t.type === 'Income' ? 'text-income-hover' : 'text-expense-hover'
                      }`}
                    >
                      {t.type === 'Income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(t)}
                        className="p-2 rounded-xl text-textSecondary hover:text-secondary hover:bg-secondary-light border border-transparent hover:border-secondary/20 transition-all duration-200"
                        title="Edit Transaction"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(t._id)}
                        className="p-2 rounded-xl text-textSecondary hover:text-expense hover:bg-expense-light border border-transparent hover:border-expense/20 transition-all duration-200"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {transactions.length > 5 && (
                <div className="text-center pt-2">
                  <a
                    href="/transactions"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-secondary hover:text-secondary-hover bg-white border border-borderLight hover:bg-bgSecondary rounded-xl shadow-sm transition-all"
                  >
                    View All {transactions.length} Transactions
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
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
