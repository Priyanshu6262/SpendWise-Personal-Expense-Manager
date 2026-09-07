import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import FloatingChatbot from '../components/chat/FloatingChatbot';

const AppLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center p-6 bg-white border border-slate-200 rounded-card shadow-card">
          <Spinner size="md" text="Authenticating..." />
          <p className="mt-2 text-xs text-slate-500 font-medium">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 relative">
      <Navbar />
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 sm:pb-8">
        <Outlet />
      </main>
      <FloatingChatbot />
    </div>
  );
};

export default AppLayout;
