import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const TransactionContext = createContext(null);

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const fetchTransactions = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const { type, category, search } = filters;
      const params = {};
      if (type && type !== 'All') params.type = type;
      if (category && category !== 'All') params.category = category;
      if (search) params.search = search;

      const res = await api.get('/transactions', { params });
      setTransactions(res.data);
    } catch (error) {
      console.error('Fetch transactions error:', error);
      showError(error.response?.data?.message || 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const addTransaction = async (transactionData) => {
    setLoading(true);
    try {
      const res = await api.post('/transactions', transactionData);
      // Prepend to transactions state
      setTransactions((prev) => [res.data, ...prev]);
      showSuccess('Transaction added successfully!');
      return true;
    } catch (error) {
      console.error('Add transaction error:', error);
      showError(error.response?.data?.message || 'Failed to add transaction.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id, transactionData) => {
    setLoading(true);
    try {
      const res = await api.put(`/transactions/${id}`, transactionData);
      // Update in state
      setTransactions((prev) =>
        prev.map((t) => (t._id === id ? res.data : t))
      );
      showSuccess('Transaction updated successfully!');
      return true;
    } catch (error) {
      console.error('Update transaction error:', error);
      showError(error.response?.data?.message || 'Failed to update transaction.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/transactions/${id}`);
      // Remove from state
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      showSuccess('Transaction deleted successfully.');
      return true;
    } catch (error) {
      console.error('Delete transaction error:', error);
      showError(error.response?.data?.message || 'Failed to delete transaction.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        loading,
        fetchTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
