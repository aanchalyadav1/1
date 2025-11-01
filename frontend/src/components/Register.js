import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';

function Register() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: '', password: '', email: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/register', form);
      alert('Registered! Please login.');
      window.location.href = '/login';
    } catch (err) {
      alert('Error: ' + err.response.data.message);
    }import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, TextField, Typography, Box } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';  // Icon for register
import api from '../api';

function Register() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/register', form);
      alert('Registration successful! Please login.');
      window.location.href = '/login';
    } catch (err) {
      // Fixed: Safe error handling for CORS/network issues
      const errorMessage = err.response?.data?.message || err.message || 'Network error or CORS issue. Check backend and env vars.';
      alert('Registration failed: ' + errorMessage);
      console.error('Register error:', err);  // For debugging
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom>{t('register')}</Typography>
      <TextField label={t('username')} fullWidth margin="normal" onChange={(e) => setForm({ ...form, username: e.target.value })} required />
      <TextField label={t('email')} type="email" fullWidth margin="normal" onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <TextField label={t('password')} type="password" fullWidth margin="normal" onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      <Button variant="contained" startIcon={<PersonAddIcon />} fullWidth onClick={handleSubmit} disabled={loading}>
        {loading ? 'Registering...' : t('register')}
      </Button>
      <Typography sx={{ mt: 2 }}>Already have an account? <Link to="/login">{t('login')}</Link></Typography>
    </Box>
  );
}

export default Register;
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder={t('username')} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
      <input type="password" placeholder={t('password')} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      <input type="email" placeholder={t('email')} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <button type="submit">{t('register')}</button>
    </form>
  );
}

export default Register;
