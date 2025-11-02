// src/components/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // ✅ Send login request to Flask backend
      const res = await api.post("/login", form);
      const token = res.data.access_token;

      if (token) {
        // Store JWT token for later API calls
        localStorage.setItem("token", token);
        alert("Login successful!");
        nav("/dashboard");
      } else {
        setErr("Invalid server response. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      const message =
        error.response?.data?.message ||
        "Login failed. Please check your credentials or try again later.";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center app-bg">
      <div className="w-full max-w-md p-8 round-card">
        <h1 className="text-3xl font-bold mb-4">Welcome Back</h1>
        <p className="text-sm text-gray-300 mb-6">
          Log in to continue to AI Music
        </p>

        <form onSubmit={handle} className="flex flex-col gap-3">
          <input
            required
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Username"
            className="p-3 rounded bg-[#0f1724] text-white"
          />
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Password"
            className="p-3 rounded bg-[#0f1724] text-white"
          />

          {err && <div className="text-red-400 text-sm">{err}</div>}
          <button
            type="submit"
            className="big-btn mt-2"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-300">
          New here?{" "}
          <Link to="/signup" className="text-green-400">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
