import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTransactions } from '../context/TransactionContext';
import {
  Plus,
  Camera,
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
  PieChart,
  ShieldCheck,
} from 'lucide-react';
import TransactionForm from '../components/TransactionForm';
import BillScanModal from '../components/BillScanModal';
import ConfirmationModal from '../components/ConfirmationModal';
import Spinner from '../components/Spinner';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import BudgetRecommendations from '../components/dashboard/BudgetRecommendations';
import FinancialReport from '../components/dashboard/FinancialReport';

const Dashboard = () => {
  const { transactions, loading, fetchTransactions, deleteTransaction } = useTransactions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
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
  const recentTransactions = transactions;

  // Financial Health Metrics
  const savingsRate =
    totalIncome > 0
      ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))
      : 0;

  const expenseRatio =
    totalIncome > 0
      ? Math.min(100, Math.round((totalExpense / totalIncome) * 100))
      : totalExpense > 0
      ? 100
      : 0;

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
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#263449]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              Live Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
            Finance Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Real-time snapshot of your income, expenses, and current financial position
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchTransactions()}
            className="inline-flex items-center justify-center font-medium text-xs px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-[#263449] text-[#F8FAFC] hover:bg-[#111C2E] hover:border-[#10B981]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#10B981]/40 disabled:opacity-50"
            title="Refresh Transactions"
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-[#94A3B8] ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setIsScanModalOpen(true)}
            className="inline-flex items-center justify-center font-semibold text-xs px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-[#10B981]/50 text-[#10B981] hover:bg-[#10B981]/10 hover:border-[#10B981] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/40"
            title="Scan bill or receipt with AI"
          >
            <Camera className="w-4 h-4 mr-1.5" />
            Scan Bill
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center font-semibold text-xs px-4 py-2.5 rounded-lg bg-[#10B981] text-white hover:bg-[#059669] active:bg-emerald-800 transition-all shadow-lg shadow-[#10B981]/20 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 focus:ring-offset-[#0B1220]"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Metrics Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Balance Card */}
        <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-5 flex flex-col justify-between hover:border-[#263449]/80 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Total Balance
            </span>
            <div
              className={`p-2 rounded-lg border ${
                totalBalance >= 0
                  ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                  : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
              }`}
            >
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div
              className={`text-2xl font-bold tracking-tight ${
                totalBalance >= 0 ? 'text-[#F8FAFC]' : 'text-[#EF4444]'
              }`}
            >
              {formatCurrency(totalBalance)}
            </div>
            <div className="text-xs text-[#94A3B8] mt-2 flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1 font-medium ${
                  totalBalance >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                }`}
              >
                {totalBalance >= 0 ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" /> Net Positive
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3.5 h-3.5" /> In Deficit
                  </>
                )}
              </span>
              <span className="text-[#64748B]">All-time net</span>
            </div>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-5 flex flex-col justify-between hover:border-[#10B981]/40 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Total Income
            </span>
            <div className="p-2 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-[#10B981]">
              {formatCurrency(totalIncome)}
            </div>
            <div className="text-xs text-[#94A3B8] mt-2 flex items-center justify-between">
              <span className="text-[#10B981] font-medium">
                {transactions.filter((t) => t.type === 'Income').length} source(s)
              </span>
              <span className="text-[#64748B]">Total received</span>
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-5 flex flex-col justify-between hover:border-[#EF4444]/40 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="p-2 rounded-lg bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-[#EF4444]">
              {formatCurrency(totalExpense)}
            </div>
            <div className="text-xs text-[#94A3B8] mt-2 flex items-center justify-between">
              <span className="text-[#EF4444] font-medium">
                {transactions.filter((t) => t.type === 'Expense').length} item(s)
              </span>
              <span className="text-[#64748B]">Total spent</span>
            </div>
          </div>
        </div>

        {/* Savings Rate Card */}
        <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-5 flex flex-col justify-between hover:border-[#6366F1]/40 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Savings Rate
            </span>
            <div className="p-2 rounded-lg bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/30">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-[#6366F1]">
              {savingsRate}%
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-[#0F172A] border border-[#263449] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#6366F1] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
                />
              </div>
              <span className="text-xs text-[#64748B] font-medium whitespace-nowrap">
                {savingsRate >= 20 ? 'Healthy' : savingsRate > 0 ? 'Fair' : 'Low'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Spending Breakdown & Quick Insights Bar */}
      <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Cash Flow Distribution</h3>
            <p className="text-xs text-[#94A3B8]">Income vs. Expense utilization</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#10B981]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]"></span>
              Retained ({100 - expenseRatio}%)
            </span>
            <span className="flex items-center gap-1.5 text-[#EF4444]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]"></span>
              Spent ({expenseRatio}%)
            </span>
          </div>
        </div>
        {/* Multi-segment Bar */}
        <div className="w-full bg-[#0F172A] border border-[#263449] h-3 rounded-full overflow-hidden flex">
          <div
            className="bg-[#EF4444] h-full transition-all duration-500"
            style={{ width: `${expenseRatio}%` }}
            title={`Spent: ${expenseRatio}%`}
          />
          <div
            className="bg-[#10B981] h-full transition-all duration-500"
            style={{ width: `${100 - expenseRatio}%` }}
            title={`Retained: ${100 - expenseRatio}%`}
          />
        </div>
      </div>

      {/* Recent Transactions Section */}
      {transactions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#F8FAFC]">Recent Activity</h2>
              <p className="text-xs text-[#94A3B8]">Your latest recorded transactions</p>
            </div>
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#10B981] hover:text-[#059669] transition-colors"
            >
              View all ({transactions.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Transaction List */}
          <div className="bg-[#111C2E] border border-[#263449] rounded-xl overflow-hidden shadow-sm">
            <div className="max-h-[385px] overflow-y-auto divide-y divide-[#263449]">
              {recentTransactions.map((t) => (
                <div
                  key={t._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-[#0F172A]/70 transition-colors"
                >
                  {/* Left: Type Icon + Title + Meta Tags */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border ${
                        t.type === 'Income'
                          ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                          : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                      }`}
                    >
                      {t.type === 'Income' ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-[#F8FAFC] truncate">
                        {t.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                        <span className="inline-flex items-center gap-1 font-medium bg-[#0F172A] border border-[#263449] px-2 py-0.5 rounded text-[#94A3B8]">
                          <Tag className="w-3 h-3 text-[#64748B]" />
                          {t.category}
                        </span>
                        <span className="text-[#64748B]">•</span>
                        <span className="inline-flex items-center gap-1 text-[#94A3B8]">
                          <Calendar className="w-3 h-3 text-[#64748B]" />
                          {formatDate(t.date)}
                        </span>
                        {t.notes && (
                          <>
                            <span className="hidden sm:inline text-[#64748B]">•</span>
                            <span
                              className="hidden sm:inline text-[#64748B] truncate max-w-[200px]"
                              title={t.notes}
                            >
                              {t.notes}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-[#263449]">
                    <span
                      className={`text-sm sm:text-base font-bold whitespace-nowrap ${
                        t.type === 'Income' ? 'text-[#10B981]' : 'text-[#EF4444]'
                      }`}
                    >
                      {t.type === 'Income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(t)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0F172A] border border-transparent hover:border-[#263449] transition-all focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                        title="Edit transaction"
                        aria-label="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(t._id)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 border border-transparent hover:border-[#EF4444]/30 transition-all focus:outline-none focus:ring-1 focus:ring-[#EF4444]"
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
          </div>
        </div>
      )}

      {/* Visual Analytics & Charts Section */}
      <DashboardCharts transactions={transactions} />

      {/* Automatic Financial Reports (Weekly & Monthly) */}
      <FinancialReport />

      {/* AI Budget Recommendations Section */}
      <BudgetRecommendations />

      {/* Transaction Add/Edit Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        transaction={editingTransaction}
      />

      {/* AI Bill / Receipt Scan Modal */}
      <BillScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
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
