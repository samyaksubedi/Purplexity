import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attach accessToken automatically
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Handle expired access token → refresh → retry request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute = originalRequest?.url?.includes('/auth/');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        // Use SAME axios instance (no hardcoded URL)
        const { data } = await api.post('/auth/refresh', {});

        const newAccessToken = data?.data?.accessToken;

        // Save to Zustand store
        useAuthStore.getState().setAccessToken(newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout user
        useAuthStore.getState().logout();
        window.location.href = '/signin';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
