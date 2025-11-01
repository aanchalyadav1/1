import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';  // For navigation links
import api from '../api';

function Login() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);  // Add loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/login', form);
      localStorage.setItem('token', res.data.access_token);
      window.location.href = '/';  // Redirect to dashboard
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || 'Check credentials or backend'));
      console.error(err);  // Log for debugging
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{t('login')}</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder={t('username')} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input type="password" placeholder={t('password')} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : t('login')}</button>
      </form>
      <p>Don't have an account? <Link to="/register">{t('register')}</Link></p>
      <p><Link to="/forgot-password">Forgot Password?</Link></p>
    </div>
  );
}

export default Login;
