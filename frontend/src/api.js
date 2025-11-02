import axios from 'axios';

const api = axios.create({
  baseURL: 'https://one-backend-6jy5.onrender.com', // your Flask backend
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
