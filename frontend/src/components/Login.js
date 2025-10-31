import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';

function Login() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', form);
      localStorage.setItem('token', res.data.access_token);
      window.location.href = '/';
    } catch (err) {
      alert('Error: ' + err.response.data.message);
    }
  };

  return (
    <div className="card">
      <h2>{t('login')}</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder={t('username')} 
          onChange={(e) => setForm({ ...form, username: e.target.value })} 
          required 
        />
        <input 
          type="password" 
          placeholder={t('password')} 
          onChange={(e) => setForm({ ...form, password: e.target.value })} 
          required 
        />
        <button type="submit">{t('login')}</button>
      </form>
    </div>
  );
}

export default Login;
