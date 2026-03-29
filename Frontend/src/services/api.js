import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // Send cookies with requests automatically
});

// Helper: read a cookie value by name
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

// Request interceptor: always attach the latest CSRF token from the cookie
api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrfToken');
  if (csrfToken) {
    config.headers['x-csrf-token'] = csrfToken;
  }
  return config;
});

// Track whether a refresh is already in progress to avoid infinite loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

function shouldRetry429WithRefresh(originalRequest, error) {
  const url = originalRequest?.url || '';
  const message = String(error?.response?.data?.message || '').toLowerCase();

  // True usage limits should never trigger a token refresh + replay.
  if (message.includes('limit reached') || message.includes('usage exhausted')) {
    return false;
  }

  // Keep 429-refresh handling only for optional-auth ATS check edge case.
  return url.includes('/ats/check');
}

// Response interceptor for handling global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't intercept the refresh call itself to prevent infinite loops
    if (originalRequest.url === '/auth/refresh') {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const shouldAttemptRefresh =
      status === 401 || (status === 429 && shouldRetry429WithRefresh(originalRequest, error));

    if (shouldAttemptRefresh && !originalRequest._retry) {
      if (isRefreshing) {
        // If a refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        // Re-fetch CSRF token since the refresh may have rotated cookies
        try {
          const { data } = await api.get('/auth/csrf-token');
          api.defaults.headers.common['x-csrf-token'] = data.csrfToken;
        } catch (_) { /* best-effort */ }
        processQueue(null);
        return api(originalRequest); // Retry original request with new token
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh token expired or failed, need to login again
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
