import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';

// Layout
import AppLayout from './layouts/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import SpendingInsights from './pages/SpendingInsights';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <TransactionProvider>
          <Router>
            <Routes>
              {/* Public Landing & Auth Routes */}
              <Route path="/" element={<LandingPage initialAuthMode="login" />} />
              <Route path="/login" element={<LandingPage initialAuthMode="login" />} />
              <Route path="/register" element={<LandingPage initialAuthMode="register" />} />

              {/* Protected Routes Wrapper */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/insights" element={<SpendingInsights />} />
              </Route>

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </TransactionProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
