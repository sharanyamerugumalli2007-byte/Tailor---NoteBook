import axios from 'axios';

const TOKEN_KEY = 'tn_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL || ''}/api`, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Expired/invalid session: clear it and send the user to login (except on the login call itself)
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      tokenStore.clear();
      if (!window.location.pathname.startsWith('/login')) window.location.assign('/login');
    }
    return Promise.reject(err);
  }
);

/** Human-friendly message from any failed request. */
export function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.code === 'ERR_NETWORK') return 'Cannot reach the server. Check that the backend is running.';
  if (err.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  return fallback;
}

/** Unwraps { success, message, data } */
export const unwrap = (p) => p.then((r) => r.data.data);
export const unwrapWithMessage = (p) => p.then((r) => r.data);

export default api;
