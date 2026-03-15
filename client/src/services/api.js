import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 by clearing stored auth and redirecting to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('qf_token');
      localStorage.removeItem('qf_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
