import axios from 'axios';

// Create an Axios instance for backend API calls
const api = axios.create({
  baseURL: 'https://one-backend-6jy5.onrender.com',  // ✅ Correct backend Render URL
  withCredentials: true,                              // Allows cookies if backend uses sessions
});

// ✅ Automatically attach JWT token to every request (if stored in localStorage)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Global error handling (e.g., expired token → redirect to login)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
