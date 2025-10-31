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
    }
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
