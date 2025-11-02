// src/api.js
import axios from 'axios';

// Use Render backend URL or fallback to localhost during development
const api = axios.create({
  baseURL: 'https://one-backend-6jy5.onrender.com',
  withCredentials: true, // required for cookies/JWT
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request (if present)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens or unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
