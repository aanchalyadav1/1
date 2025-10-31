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
      <input type="text" placeholder={
