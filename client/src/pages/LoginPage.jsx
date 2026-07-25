import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      console.error('Login error', err);
      setError(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  const handleDemo = async () => {
    setError('');
    try {
      const res = await api.get('/dev/seed', { params: { email: 'demo@local' } });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      if (user) setUser(user);
      navigate('/');
    } catch (err) {
      setError('Demo login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <h2 className="text-3xl font-semibold">Welcome back</h2>
        <p className="mt-2 text-slate-400">Sign in to continue your fitness journey.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">Login</button>
        </form>
        <p className="mt-4 text-sm text-slate-400">No account? <Link className="text-cyan-400" to="/register">Create one</Link></p>
        <div className="mt-3">
          <button type="button" onClick={handleDemo} className="w-full rounded-xl bg-slate-700 px-4 py-3 font-semibold text-slate-100">Use demo account</button>
        </div>
      </motion.div>
    </div>
  );
}
