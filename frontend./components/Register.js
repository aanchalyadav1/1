import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';

function Register() {
  const { t } = useTranslation();
  const [form, setForm] =
