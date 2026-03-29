import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch CSRF token strictly on startup
  const initCsrf = async () => {
    try {
      const { data } = await api.get('/auth/csrf-token');
      api.defaults.headers.common['x-csrf-token'] = data.csrfToken;
    } catch (error) {
      console.error("Failed to initialize CSRF token");
    }
  };

  // Check generic auth status on load
  const checkAuthStatus = async () => {
    try {
      const { data } = await api.get('/auth/get-me');
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Safety timeout: force loading to false if init takes too long
    const safetyTimer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn("Auth init timed out — forcing loading to false");
        }
        return false;
      });
    }, 8000);

    const init = async () => {
      await initCsrf();
      await checkAuthStatus();
    };
    init();

    return () => clearTimeout(safetyTimer);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await initCsrf(); // Refresh CSRF token after auth cookies change
      setUser(data.user);
      toast.success('Logged in successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      await initCsrf(); // Refresh CSRF token after auth cookies change
      setUser(data.user);
      toast.success('Registered successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const logoutAll = async () => {
    try {
      await api.post('/auth/logout-all');
      setUser(null);
      toast.success('Logged out from all devices securely');
    } catch (error) {
      toast.error('Error logging out from all devices');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, logoutAll }}>
      {children}
    </AuthContext.Provider>
  );
};
