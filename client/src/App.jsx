import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';

// Layout
import AppLayout from './layouts/AppLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <TransactionProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes Wrapper */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/profile" element={<Profile />} />
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
