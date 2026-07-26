import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const workouts = [
  { id: 1, name: 'Upper Body Strength', category: 'Strength', duration: 45, calories: 320 },
  { id: 2, name: 'HIIT Cardio', category: 'Cardio', duration: 25, calories: 280 }
];

export default function WorkoutsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', category: 'Strength', duration: '', calories: '' });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.get('/workouts')
      .then((res) => { if (mounted) setItems(res.data); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const addWorkout = (e) => {
    e.preventDefault();
    if (editingId) {
      api.put(`/workouts/${editingId}`, { ...form, duration: Number(form.duration), calories: Number(form.calories) })
        .then((res) => { setItems(items.map((it) => ((it._id || it.id) === (editingId) ? res.data : it))); toast.success('Workout updated'); })
        .catch(() => { toast.error('Failed to update workout'); })
        .finally(() => { setForm({ name: '', category: 'Strength', duration: '', calories: '' }); setEditingId(null); });
    } else {
      api.post('/workouts', { ...form, duration: Number(form.duration), calories: Number(form.calories) })
        .then((res) => { setItems([res.data, ...items]); toast.success('Workout saved'); })
        .catch(() => { toast.error('Failed to save workout'); })
        .finally(() => setForm({ name: '', category: 'Strength', duration: '', calories: '' }));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Workout Tracker</h2>
            <p className="text-slate-400">Plan, log, and review your training sessions.</p>
          </div>
          <button type="button" onClick={() => setShowForm(!showForm)} className="rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">{showForm ? 'Hide' : 'Add Workout'}</button>
        </div>
        {showForm && (
          <form onSubmit={addWorkout} className="mt-6 grid gap-4 md:grid-cols-4">
          <input className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3" placeholder="Workout name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option>Strength</option><option>Cardio</option><option>Mobility</option><option>Yoga</option>
          </select>
          <input className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3" type="number" placeholder="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          <input className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3" type="number" placeholder="Calories" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} />
            <button className="md:col-span-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950"><FiPlus /> {editingId ? 'Update Workout' : 'Save Workout'}</button>
          </form>
        )}
      </div>

      <div className="grid gap-4">
        {loading ? <p className="text-slate-400">Loading...</p> : items.map((item) => (
          <div key={item._id || item.id} className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-slate-400">{item.category} • {item.duration} min • {item.calories} kcal</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => { setEditingId(item._id || item.id); setForm({ name: item.name, category: item.category, duration: item.duration, calories: item.calories }); setShowForm(true); }} className="rounded-xl border border-slate-700 p-2"><FiEdit /></button>
              <button type="button" onClick={() => { api.delete(`/workouts/${item._id || item.id}`).then(() => { setItems(items.filter((it) => (it._id || it.id) !== (item._id || item.id))); toast.success('Workout deleted'); }).catch(() => toast.error('Failed to delete workout')); }} className="rounded-xl border border-slate-700 p-2"><FiTrash2 /></button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
