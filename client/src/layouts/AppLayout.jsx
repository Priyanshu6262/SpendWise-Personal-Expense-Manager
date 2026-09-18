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
      <div className="flex h-screen items-center justify-center bg-[#0B1220]">
        <div className="text-center p-6 bg-[#111C2E] border border-[#263449] rounded-card shadow-card">
          <Spinner size="md" text="Authenticating..." />
          <p className="mt-2 text-xs text-[#94A3B8] font-medium">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1220] text-[#F8FAFC] relative">
      <Navbar />
      <main className="flex-grow w-full px-[100px] py-6 sm:py-8 pb-20 sm:pb-8">
        <Outlet />
      </main>
      <FloatingChatbot />
    </div>
  );
};

export default AppLayout;
