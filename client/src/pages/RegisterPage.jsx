import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', gender: 'Other' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <h2 className="text-3xl font-semibold">Create account</h2>
        <p className="mt-2 text-slate-400">Join FitAI and start tracking smarter.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input required autoComplete="name" className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required autoComplete="email" className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required minLength="6" autoComplete="new-password" className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3" placeholder="Age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          <select className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button disabled={false} className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60" type="submit">Create account</button>
        </form>
        <p className="mt-4 text-sm text-slate-400">Already have an account? <Link className="text-cyan-400" to="/login">Login</Link></p>
      </motion.div>
    </div>
  );
}
