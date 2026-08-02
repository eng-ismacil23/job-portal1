import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('jp_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('jp_token') || null;
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/users/login', { email, password });
      if (res.data && res.data.token) {
        const tokenVal = res.data.token;
        const userData = res.data.data;

        localStorage.setItem('jp_token', tokenVal);
        localStorage.setItem('jp_user', JSON.stringify(userData));

        setToken(tokenVal);
        setUser(userData);
        return { success: true, message: res.data.message };
      } else {
        return { success: false, message: res.data.message || 'Login failed' };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post('/users/register', userData);
      if (res.data && res.data.token) {
        const tokenVal = res.data.token;
        const newUser = res.data.data;

        localStorage.setItem('jp_token', tokenVal);
        localStorage.setItem('jp_user', JSON.stringify(newUser));

        setToken(tokenVal);
        setUser(newUser);
        return { success: true, message: res.data.message };
      } else {
        return { success: true, message: res.data.message || 'Registration successful. Please log in.' };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jp_token');
    localStorage.removeItem('jp_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
