import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api'; // ✅ import axios instance (no firebase here if you use backend auth)

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setErr('');

    try {
      // ✅ POST to backend login route
      const res = await api.post('/login', { email, password });

      // ✅ Save token returned from backend
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
      }

      // ✅ Redirect after successful login
      nav('/dashboard');
    } catch (error) {
      let message = 'Login failed. Please try again.';
      if (error.response?.status === 400) message = 'Invalid credentials.';
      else if (error.response?.status === 404) message = 'User not found.';
      else if (error.response?.status === 401) message = 'Incorrect password.';
      setErr(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center app-bg">
      <div className="w-full max-w-md p-8 round-card">
        <h1 className="text-3xl font-bold mb-4">Welcome Back</h1>
        <p className="text-sm text-gray-300 mb-6">Log in to continue to AI Music</p>

        <form onSubmit={handle} className="flex flex-col gap-3">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="p-3 rounded bg-[#0f1724] text-white"
          />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="p-3 rounded bg-[#0f1724] text-white"
          />
          {err && <div className="text-red-400 text-sm">{err}</div>}
          <button type="submit" className="big-btn mt-2">Login</button>
        </form>

        <p className="mt-4 text-sm text-gray-300">
          New here?{' '}
          <Link to="/signup" className="text-green-400">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
