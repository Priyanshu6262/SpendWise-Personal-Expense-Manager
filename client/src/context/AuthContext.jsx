import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, ...userData } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      showSuccess(`Welcome back, ${userData.name}!`);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      showError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { token, ...userData } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      showSuccess(`Account created! Welcome, ${userData.name}.`);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      const msg = error.response?.data?.message || 'Registration failed.';
      showError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    showSuccess('Logged out successfully.');
  };

  const updateProfile = async (name, email, password) => {
    setLoading(true);
    try {
      const payload = { name, email };
      if (password) {
        payload.password = password;
      }
      const res = await api.put('/auth/profile', payload);
      const { token, ...userData } = res.data;

      if (token) {
        localStorage.setItem('token', token);
      }
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      showSuccess('Profile updated successfully!');
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      const msg = error.response?.data?.message || 'Failed to update profile.';
      showError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
