import axios from 'axios';
import type { AuthSession, RefreshTokenRequest } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const authSession = localStorage.getItem('authSession');
    if (authSession) {
      const { accessToken } = JSON.parse(authSession);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    if (config.url && config.url.includes('/tenants/{tenantKey}/')) {
      const selectedTenantKey = localStorage.getItem('selectedTenantKey');
      if (selectedTenantKey) {
        config.url = config.url.replace('{tenantKey}', selectedTenantKey);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/api/Auth/refresh-token')) {
        localStorage.removeItem('authSession');
        localStorage.removeItem('idToken');
        localStorage.removeItem('selectedTenantKey');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const authSessionStr = localStorage.getItem('authSession');
      if (!authSessionStr) {
        window.location.href = '/login';
        return Promise.reject(error);
      }

      const authSession: AuthSession = JSON.parse(authSessionStr);
      
      if (!authSession.refreshToken) {
        localStorage.removeItem('authSession');
        localStorage.removeItem('idToken');
        localStorage.removeItem('selectedTenantKey');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const refreshData: RefreshTokenRequest = {
          refreshToken: authSession.refreshToken,
        };

        const response = await api.post<AuthSession>('/api/Auth/refresh-token', refreshData);
        const newAuthSession = response.data;

        const sessionWithAdmin = {
          ...newAuthSession,
          isPlatformAdmin: authSession.isPlatformAdmin,
        };

        localStorage.setItem('authSession', JSON.stringify(sessionWithAdmin));
        localStorage.setItem('idToken', newAuthSession.idToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${newAuthSession.accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAuthSession.accessToken}`;

        processQueue(null);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        
        localStorage.removeItem('authSession');
        localStorage.removeItem('idToken');
        localStorage.removeItem('selectedTenantKey');
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
