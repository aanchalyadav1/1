import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, TextField, Typography, Box, LinearProgress, Alert, IconButton } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api from '../api';

function Register() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [versionCheck, setVersionCheck] = useState(null);

  // Check app version on load (example: fetch from backend)
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await api.get('/version');  // Assume backend has /version endpoint
        if (res.data.version !== '1.0.0') {  // Replace with your app version
          setVersionCheck('App update available. Please refresh.');
        }
      } catch (err) {
        console.log('Version check failed:', err);
      }
    };
    checkVersion();
  }, []);

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!form.username || form.username.length < 3) newErrors.username = 'Username must be at least 3 characters.';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email address.';
    if (!form.password || form.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await api.post('/register', form);
      alert('Registration successful! Please login.');
      window.location.href = '/login';
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Network error or CORS issue. Check backend.';
      setErrors({ submit: errorMessage });
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (field === 'password') calculatePasswordStrength(e.target.value);
    if (errors[field]) setErrors({ ...errors, [field]: '' });  // Clear error on change
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 5, p: 4, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 3 }}>
      <Typography variant="h4" gutterBottom align="center">{t('register')}</Typography>
      {versionCheck && <Alert severity="info" sx={{ mb: 2 }}>{versionCheck}</Alert>}
      {errors.submit && <Alert severity="error" sx={{ mb: 2 }}>{errors.submit}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label={t('username')}
          fullWidth
          margin="normal"
          value={form.username}
          onChange={handleChange('username')}
          error={!!errors.username}
          helperText={errors.username}
          required
        />
        <TextField
          label={t('email')}
          type="email"
          fullWidth
          margin="normal"
          value={form.email}
          onChange={handleChange('email')}
          error={!!errors.email}
          helperText={errors.email}
          required
        />
        <TextField
          label={t('password')}
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={form.password}
          onChange={handleChange('password')}
          error={!!errors.password}
          helperText={errors.password}
          InputProps={{
            endAdornment: (
              <IconButton onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            ),
          }}
          required
        />
        {form.password && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">Password Strength</Typography>
            <LinearProgress variant="determinate" value={passwordStrength} color={passwordStrength < 50 ? 'error' : passwordStrength < 75 ? 'warning' : 'success'} />
          </Box>
        )}
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Registering...' : t('register')}
        </Button>
      </form>
      <Typography sx={{ mt: 2, textAlign: 'center' }}>
        Already have an account? <Link to="/login">{t('login')}</Link>
      </Typography>
    </Box>
  );
}

export default Register;
