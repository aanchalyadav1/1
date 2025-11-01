import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, TextField, Typography, Box } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import api from '../api';

function Login() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/login', form);
      localStorage.setItem('token', res.data.access_token);
      window.location.href = '/';
    } catch (err) {
      // Fixed: Safe error handling for CORS/network issues
      const errorMessage = err.response?.data?.message || err.message || 'Network error or CORS issue. Check backend and env vars.';
      alert('Login failed: ' + errorMessage);
      console.error('Login error:', err);  // For debugging
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom>{t('login')}</Typography>
      <TextField label={t('username')} fullWidth margin="normal" onChange={(e) => setForm({ ...form, username: e.target.value })} required />
      <TextField label={t('password')} type="password" fullWidth margin="normal" onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      <Button variant="contained" startIcon={<LoginIcon />} fullWidth onClick={handleSubmit} disabled={loading}>
        {loading ? 'Logging in...' : t('login')}
      </Button>
      <Typography sx={{ mt: 2 }}>Don't have an account? <Link to="/register">{t('register')}</Link></Typography>
      <Typography><Link to="/forgot-password">Forgot Password?</Link></Typography>
    </Box>
  );
}

export default Login;
