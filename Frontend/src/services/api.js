import axios from 'react';
import axiosInstance from 'axios';

const api = axiosInstance.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // Send cookies with requests automatically
});

// Response interceptor for handling global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet, attempts to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(originalRequest); // Retry original request with new token
      } catch (refreshError) {
        // Refresh token expired or failed, need to login again
        // Let the AuthContext handle this by checking get-me
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
