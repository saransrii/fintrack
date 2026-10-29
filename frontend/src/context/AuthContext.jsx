import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('fintrack_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('fintrack_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data);
    localStorage.setItem('fintrack_user', JSON.stringify(res.data));
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    setUser(res.data);
    localStorage.setItem('fintrack_user', JSON.stringify(res.data));
    return res.data;
  };

  const loginGuest = async () => {
    const res = await api.post('/auth/guest');
    setUser(res.data);
    localStorage.setItem('fintrack_user', JSON.stringify(res.data));
    return res.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fintrack_user');
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    const updated = { ...user, ...res.data };
    setUser(updated);
    localStorage.setItem('fintrack_user', JSON.stringify(updated));
    return updated;
  };

  const triggerSeed = async () => {
    const res = await api.post('/transactions/seed');
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginGuest,
        logout,
        updateProfile,
        triggerSeed,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
