import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, TextField, Typography, Box, LinearProgress, Alert, IconButton } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api from '../api';

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.username || form.username.length < 3)
      newErrors.username = 'Username must be at least 3 characters.';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = 'Invalid email address.';
    if (!form.password || form.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await api.post('/register', form);
      alert('Registration successful! Please log in.');
      window.location.href = '/login';
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Server error. Please try again.';
      setErrors({ submit: msg });
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (field === 'password') calculatePasswordStrength(e.target.value);
  };

  return (
    <Box
      sx={{
        maxWidth: 450,
        mx: 'auto',
        mt: 5,
        p: 4,
        bgcolor: '#0f1724',
        borderRadius: 3,
        color: 'white',
        boxShadow: 3,
      }}
    >
      <Typography variant="h4" gutterBottom align="center">
        Create Account
      </Typography>
      {errors.submit && <Alert severity="error">{errors.submit}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={form.username}
          onChange={handleChange('username')}
          error={!!errors.username}
          helperText={errors.username}
          required
        />
        <TextField
          label="Email"
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
          label="Password"
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
            <LinearProgress
              variant="determinate"
              value={passwordStrength}
              color={
                passwordStrength < 50
                  ? 'error'
                  : passwordStrength < 75
                  ? 'warning'
                  : 'success'
              }
            />
          </Box>
        )}
        <Button
          type="submit"
          variant="contained"
          startIcon={<PersonAddIcon />}
          fullWidth
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>
      <Typography sx={{ mt: 2, textAlign: 'center' }}>
        Already have an account? <Link to="/login">Login</Link>
      </Typography>
    </Box>
  );
}

export default Register;
