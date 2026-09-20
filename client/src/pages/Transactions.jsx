import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  RefreshCw,
  Download,
  IndianRupee,
  Receipt,
  Utensils,
  ShoppingBag,
  Plane,
  Film,
  Landmark,
  Briefcase,
  Building2,
  ArrowUpDown,
} from 'lucide-react';
import TransactionForm from '../components/TransactionForm';
import ConfirmationModal from '../components/ConfirmationModal';
import Spinner from '../components/Spinner';

const EXPENSE_CATEGORIES = ['Food', 'Shopping', 'Bills', 'Travel', 'Entertainment', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Other'];
const ALL_CATEGORIES = [...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])];

// Category metadata helper (icons + colors)
const getCategoryMeta = (category) => {
  switch (category) {
    case 'Food':
      return {
        icon: Utensils,
        color: 'text-amber-400 bg-amber-400/10 border-amber-400/25',
      };
    case 'Shopping':
      return {
        icon: ShoppingBag,
        color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/25',
      };
    case 'Bills':
      return {
        icon: Receipt,
        color: 'text-sky-400 bg-sky-400/10 border-sky-400/25',
      };
    case 'Travel':
      return {
        icon: Plane,
        color: 'text-teal-400 bg-teal-400/10 border-teal-400/25',
      };
    case 'Entertainment':
      return {
        icon: Film,
        color: 'text-purple-400 bg-purple-400/10 border-purple-400/25',
      };
    case 'Salary':
      return {
        icon: Landmark,
        color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
      };
    case 'Freelance':
      return {
        icon: Briefcase,
        color: 'text-blue-400 bg-blue-400/10 border-blue-400/25',
      };
    case 'Business':
      return {
        icon: Building2,
        color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/25',
      };
    default:
      return {
        icon: Tag,
        color: 'text-slate-300 bg-slate-400/10 border-slate-400/25',
      };
  }
};

const Transactions = () => {
  const { transactions, loading, fetchTransactions, deleteTransaction } = useTransactions();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters & Search state
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Trigger search/filter fetch
  const handleFetch = useCallback(() => {
    fetchTransactions({ type, category, search });
  }, [fetchTransactions, type, category, search]);

  useEffect(() => {
    // Instant debounce for typing
    const delayDebounceFn = setTimeout(() => {
      handleFetch();
      setCurrentPage(1);
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

  // Client-side sorting on retrieved transactions
  const sortedTransactions = useMemo(() => {
    const list = [...transactions];
    switch (sortBy) {
      case 'date-asc':
        return list.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'date-desc':
        return list.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'amount-desc':
        return list.sort((a, b) => b.amount - a.amount);
      case 'amount-asc':
        return list.sort((a, b) => a.amount - b.amount);
      case 'title-asc':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return list;
    }
  }, [transactions, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / itemsPerPage));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(start, start + itemsPerPage);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  // Statistics calculation based on current transactions
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    transactions.forEach((t) => {
      if (t.type === 'Income') {
        income += t.amount;
        incomeCount++;
      } else if (t.type === 'Expense') {
        expense += t.amount;
        expenseCount++;
      }
    });

    return {
      income,
      expense,
      incomeCount,
      expenseCount,
      net: income - expense,
      total: transactions.length,
    };
  }, [transactions]);

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
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  const isFiltered = search !== '' || type !== 'All' || category !== 'All' || sortBy !== 'date-desc';

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // CSV Export feature
  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Date', 'Title', 'Type', 'Category', 'Amount (INR)', 'Notes'];
    const rows = sortedTransactions.map((t) => [
      `"${new Date(t.date).toISOString().split('T')[0]}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${t.type}"`,
      `"${t.category}"`,
      t.amount,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SpendWise_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#263449]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              Live Records
            </span>
            {!loading && (
              <span className="px-2 py-0.5 text-xs font-medium bg-[#111C2E] text-[#94A3B8] rounded-full border border-[#263449]">
                {transactions.length} total
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Track, filter, and manage your complete income and expense cashflow
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export CSV */}
          <button
            onClick={exportToCSV}
            disabled={transactions.length === 0}
            className="inline-flex items-center justify-center font-medium text-xs px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-[#263449] text-[#F8FAFC] hover:bg-[#111C2E] hover:border-[#10B981]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#10B981]/40 disabled:opacity-40 disabled:pointer-events-none shadow-sm"
            title="Export filtered transactions as CSV"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-[#94A3B8]" />
            Export CSV
          </button>

          {/* Refresh */}
          <button
            onClick={() => handleFetch()}
            className="inline-flex items-center justify-center font-medium text-xs px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-[#263449] text-[#F8FAFC] hover:bg-[#111C2E] hover:border-[#10B981]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#10B981]/40 disabled:opacity-50 shadow-sm"
            title="Refresh Transactions"
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-[#94A3B8] ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>

          {/* Add Transaction Primary CTA */}
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center font-semibold text-xs px-4 py-2.5 rounded-lg bg-[#10B981] text-white hover:bg-[#059669] active:bg-emerald-800 transition-all shadow-lg shadow-[#10B981]/20 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 focus:ring-offset-[#0B1220]"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Records Card */}
        <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#263449]/90 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Total Records
            </span>
            <div className="p-2 rounded-lg bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/30">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
              {stats.total}
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Active ledger entries
            </p>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#10B981]/40 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Total Inflow
            </span>
            <div className="p-2 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-[#10B981]">
              {formatCurrency(stats.income)}
            </div>
            <p className="text-xs text-[#94A3B8] mt-1 flex items-center gap-1">
              <span className="text-[#10B981] font-semibold">{stats.incomeCount}</span> income entries
            </p>
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#EF4444]/40 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Total Outflow
            </span>
            <div className="p-2 rounded-lg bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-[#EF4444]">
              {formatCurrency(stats.expense)}
            </div>
            <p className="text-xs text-[#94A3B8] mt-1 flex items-center gap-1">
              <span className="text-[#EF4444] font-semibold">{stats.expenseCount}</span> expense entries
            </p>
          </div>
        </div>

        {/* Net Balance Card */}
        <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#263449]/90 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Net Cashflow
            </span>
            <div
              className={`p-2 rounded-lg border ${
                stats.net >= 0
                  ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                  : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
              }`}
            >
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-bold tracking-tight ${
                stats.net >= 0 ? 'text-[#F8FAFC]' : 'text-[#EF4444]'
              }`}
            >
              {stats.net < 0 ? '-' : '+'} {formatCurrency(Math.abs(stats.net))}
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              {stats.net >= 0 ? (
                <span className="text-[#10B981] font-medium">Net Surplus balance</span>
              ) : (
                <span className="text-[#EF4444] font-medium">Net Deficit</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-[#111C2E] border border-[#263449] rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
        {/* Top Filter Row: Type Segmented Pills + Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Segmented Type Switcher */}
          <div className="flex items-center p-1 bg-[#0F172A] rounded-lg border border-[#263449] self-start sm:self-auto">
            <button
              onClick={() => setType('All')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                type === 'All'
                  ? 'bg-[#111C2E] text-[#F8FAFC] shadow-sm border border-[#263449]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <span>All</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#263449]/70 text-[#94A3B8]">
                {transactions.length}
              </span>
            </button>

            <button
              onClick={() => setType('Expense')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                type === 'Expense'
                  ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#EF4444]'
              }`}
            >
              <span>Expenses</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#EF4444]/20 text-[#EF4444]">
                {stats.expenseCount}
              </span>
            </button>

            <button
              onClick={() => setType('Income')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                type === 'Income'
                  ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#10B981]'
              }`}
            >
              <span>Income</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#10B981]/20 text-[#10B981]">
                {stats.incomeCount}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-grow max-w-lg">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, category, or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-[#0F172A] border border-[#263449] rounded-lg text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F8FAFC] p-1 rounded transition"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filter Row: Category + Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#263449]/70">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Category Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-medium text-[#94A3B8] whitespace-nowrap flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#94A3B8]" />
                Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-grow sm:flex-grow-0 px-3 py-1.5 bg-[#0F172A] border border-[#263449] rounded-lg text-xs font-medium text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981] transition-all"
              >
                <option value="All">All Categories</option>
                {getCategoryOptions().map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-medium text-[#94A3B8] whitespace-nowrap flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#94A3B8]" />
                Sort:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-grow sm:flex-grow-0 px-3 py-1.5 bg-[#0F172A] border border-[#263449] rounded-lg text-xs font-medium text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981] transition-all"
              >
                <option value="date-desc">Date: Newest First</option>
                <option value="date-asc">Date: Oldest First</option>
                <option value="amount-desc">Amount: High to Low</option>
                <option value="amount-asc">Amount: Low to High</option>
                <option value="title-asc">Title: A to Z</option>
              </select>
            </div>
          </div>

          {/* Active Filter Indicator & Reset */}
          {isFiltered && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Filters Active</span>
              </div>
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-[#EF4444] hover:text-red-400 hover:underline transition ml-1"
              >
                Reset all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transactions Table & Mobile View Card */}
      <div className="bg-[#111C2E] border border-[#263449] rounded-xl overflow-hidden shadow-sm">
        {loading && transactions.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Spinner size="md" text="Loading ledger..." />
            <p className="text-xs text-[#94A3B8]">Syncing your financial records</p>
          </div>
        ) : sortedTransactions.length === 0 ? (
          /* Empty State */
          <div className="p-12 sm:p-16 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#0F172A] border border-[#263449] flex items-center justify-center text-[#94A3B8] mb-4 shadow-inner">
              <Search className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC] mb-1.5">No transactions found</h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mb-6 leading-relaxed">
              {isFiltered
                ? 'We could not find any records matching your current filter or search criteria.'
                : 'Your transaction record is empty. Start recording your expenses and income to see them here.'}
            </p>
            {isFiltered ? (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F172A] border border-[#263449] text-xs font-semibold text-[#F8FAFC] hover:bg-[#152338] transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            ) : (
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#10B981] text-xs font-semibold text-white hover:bg-[#059669] shadow-lg shadow-[#10B981]/20 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Add Your First Transaction
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#0F172A]/70 text-[#94A3B8] font-semibold text-xs border-b border-[#263449]">
                    <th scope="col" className="px-6 py-4 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-4 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-4 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-4 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-4 text-right uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-4 text-center uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#263449]/60 text-[#F8FAFC]">
                  {paginatedTransactions.map((t) => {
                    const categoryMeta = getCategoryMeta(t.category);
                    const CategoryIcon = categoryMeta.icon;
                    const isIncome = t.type === 'Income';

                    return (
                      <tr
                        key={t._id}
                        className="hover:bg-[#162235]/60 transition-colors group"
                      >
                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-[#94A3B8] font-medium text-xs">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                            {formatDate(t.date)}
                          </span>
                        </td>

                        {/* Description & Notes */}
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[#F8FAFC] leading-snug group-hover:text-[#10B981] transition-colors">
                            {t.title}
                          </div>
                          {t.notes && (
                            <div
                              className="text-xs text-[#94A3B8] mt-0.5 max-w-xs truncate"
                              title={t.notes}
                            >
                              {t.notes}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${categoryMeta.color}`}
                          >
                            <CategoryIcon className="w-3.5 h-3.5" />
                            {t.category}
                          </span>
                        </td>

                        {/* Type */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                              isIncome
                                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                                : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                            }`}
                          >
                            {isIncome ? (
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
                          className={`px-6 py-4 whitespace-nowrap text-right font-bold tracking-tight text-sm sm:text-base ${
                            isIncome ? 'text-[#10B981]' : 'text-[#EF4444]'
                          }`}
                        >
                          {isIncome ? '+' : '-'} {formatCurrency(t.amount)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => handleEdit(t)}
                              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#10B981] hover:bg-[#10B981]/10 border border-transparent hover:border-[#10B981]/30 transition focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                              title="Edit transaction"
                              aria-label="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(t._id)}
                              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 border border-transparent hover:border-[#EF4444]/30 transition focus:outline-none focus:ring-1 focus:ring-[#EF4444]"
                              title="Delete transaction"
                              aria-label="Delete transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="sm:hidden divide-y divide-[#263449]/70">
              {paginatedTransactions.map((t) => {
                const categoryMeta = getCategoryMeta(t.category);
                const CategoryIcon = categoryMeta.icon;
                const isIncome = t.type === 'Income';

                return (
                  <div
                    key={t._id}
                    className="p-4 space-y-2.5 hover:bg-[#162235]/40 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className={`p-2 rounded-lg border mt-0.5 ${categoryMeta.color}`}>
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#F8FAFC] leading-snug">
                            {t.title}
                          </h4>
                          <p className="text-xs text-[#94A3B8] mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#64748B]" />
                            {formatDate(t.date)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-sm font-bold tracking-tight block ${
                            isIncome ? 'text-[#10B981]' : 'text-[#EF4444]'
                          }`}
                        >
                          {isIncome ? '+' : '-'} {formatCurrency(t.amount)}
                        </span>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                            isIncome
                              ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                              : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                          }`}
                        >
                          {t.type}
                        </span>
                      </div>
                    </div>

                    {t.notes && (
                      <p className="text-xs text-[#94A3B8] bg-[#0F172A]/70 px-2.5 py-1.5 rounded border border-[#263449]/50">
                        {t.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#263449]/50 text-xs">
                      <span className="text-[11px] font-medium text-[#94A3B8]">
                        Category: <strong className="text-[#F8FAFC]">{t.category}</strong>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(t)}
                          className="px-2.5 py-1 text-xs font-medium text-[#94A3B8] hover:text-[#10B981] hover:bg-[#10B981]/10 rounded border border-[#263449] transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(t._id)}
                          className="px-2.5 py-1 text-xs font-medium text-[#EF4444] hover:bg-[#EF4444]/10 rounded border border-[#EF4444]/30 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls & Ledger Summary Footer */}
            <div className="px-6 py-4 bg-[#0F172A]/70 border-t border-[#263449] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
              <div>
                Showing{' '}
                <span className="font-semibold text-[#F8FAFC]">
                  {sortedTransactions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-[#F8FAFC]">
                  {Math.min(currentPage * itemsPerPage, sortedTransactions.length)}
                </span>{' '}
                of <span className="font-semibold text-[#F8FAFC]">{sortedTransactions.length}</span> entries
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-[#263449] bg-[#111C2E] text-[#F8FAFC] hover:bg-[#162235] disabled:opacity-30 disabled:pointer-events-none transition"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => setCurrentPage(num)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                          currentPage === num
                            ? 'bg-[#10B981] text-white'
                            : 'bg-[#111C2E] border border-[#263449] text-[#94A3B8] hover:text-[#F8FAFC]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-[#263449] bg-[#111C2E] text-[#F8FAFC] hover:bg-[#162235] disabled:opacity-30 disabled:pointer-events-none transition"
                  >
                    Next
                  </button>
                </div>
              )}
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
