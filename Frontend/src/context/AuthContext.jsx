import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const getAuthErrorMessage = (error, action) => {
  const status = error?.response?.status;
  const rawServerMessage = error?.response?.data?.message;
  const serverMessage = String(rawServerMessage || '').trim().toLowerCase();

  if (!error?.response) {
    return 'Network issue. Please check your internet connection and try again.';
  }

  if (status === 400 && action === 'login') {
    if (serverMessage.includes('invalid email or password')) {
      return 'Incorrect email or password. Please try again.';
    }
    return 'Please check your email and password and try again.';
  }

  if (status === 400 && action === 'register') {
    if (serverMessage.includes('already exists')) {
      return 'An account with this email already exists. Please login instead.';
    }
    return 'Please review your registration details and try again.';
  }

  if (status === 401) {
    if (action === 'login') {
      return 'Incorrect email or password. Please try again.';
    }
    return 'Your session has expired. Please login again.';
  }

  if (status === 403) {
    return 'Security verification failed. Please refresh and try again.';
  }

  if (status >= 500) {
    return 'Server issue. Please try again in a moment.';
  }

  if (rawServerMessage) {
    return String(rawServerMessage);
  }

  if (action === 'login') {
    return 'Unable to login right now. Please try again.';
  }

  if (action === 'register') {
    return 'Unable to register right now. Please try again.';
  }

  if (action === 'logoutAll') {
    return 'Unable to logout from all devices right now. Please try again.';
  }

  return 'Unable to logout right now. Please try again.';
};

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
      toast.error(getAuthErrorMessage(error, 'login'));
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
      toast.error(getAuthErrorMessage(error, 'register'));
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      if (error?.response?.status === 401) {
        setUser(null);
      }
      toast.error(getAuthErrorMessage(error, 'logout'));
    }
  };

  const logoutAll = async () => {
    try {
      await api.post('/auth/logout-all');
      setUser(null);
      toast.success('Logged out from all devices securely');
    } catch (error) {
      if (error?.response?.status === 401) {
        setUser(null);
      }
      toast.error(getAuthErrorMessage(error, 'logoutAll'));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, logoutAll }}>
      {children}
    </AuthContext.Provider>
  );
};
