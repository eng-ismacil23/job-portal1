import axios from 'axios';

// Fiiro gaar ah: marka la deploy-gareynayo, deji VITE_API_URL faylka .env
// (tusaale: VITE_API_URL=https://api.tusaale.com). Haddii aan la dejin,
// waxa loo isticmaalaa localhost:3001 (dev only).
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header with Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jp_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for responses to handle 401 unauthorized errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request - token invalid or expired');
    }
    return Promise.reject(error);
  }
);

export { API_BASE_URL };
export default api;
