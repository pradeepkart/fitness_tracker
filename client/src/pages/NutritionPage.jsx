import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

const meals = [
  { id: 1, name: 'Greek Yogurt Bowl', calories: 320, protein: 24, carbs: 38, fat: 10 },
  { id: 2, name: 'Chicken Salad', calories: 410, protein: 31, carbs: 20, fat: 18 }
];

export default function NutritionPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/meals').then((res) => { if (mounted) setItems(res.data); }).catch(() => {}).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const addMeal = (e) => {
    e.preventDefault();
    if (editingId) {
      api.put(`/meals/${editingId}`, { ...form, calories: Number(form.calories), protein: Number(form.protein), carbs: Number(form.carbs), fat: Number(form.fat) })
          .then((res) => { setItems(items.map((it) => ((it._id || it.id) === (editingId) ? res.data : it))); toast.success('Meal updated'); })
          .catch(() => { toast.error('Failed to update meal'); })
        .finally(() => { setForm({ name: '', calories: '', protein: '', carbs: '', fat: '' }); setEditingId(null); });
    } else {
      api.post('/meals', { ...form, calories: Number(form.calories), protein: Number(form.protein), carbs: Number(form.carbs), fat: Number(form.fat) })
          .then((res) => { setItems([res.data, ...items]); toast.success('Meal added'); })
          .catch(() => { toast.error('Failed to add meal'); })
        .finally(() => setForm({ name: '', calories: '', protein: '', carbs: '', fat: '' }));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 className="text-2xl font-semibold">Nutrition Tracker</h2>
        <p className="text-slate-400">Log meals and keep your macros balanced.</p>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Nutrition Tracker</h2>
          <button type="button" onClick={() => setShowForm(!showForm)} className="rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">{showForm ? 'Hide' : 'Add Meal'}</button>
        </div>
        {showForm && (
          <form onSubmit={addMeal} className="mt-6 grid gap-4 md:grid-cols-5">
          <input className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3" placeholder="Meal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3" type="number" placeholder="Calories" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} />
          <input className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3" type="number" placeholder="Protein" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} />
          <input className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3" type="number" placeholder="Carbs" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} />
          <input className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3" type="number" placeholder="Fat" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} />
            <button className="md:col-span-5 rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">{editingId ? 'Update meal' : 'Add meal'}</button>
          </form>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {loading ? <p className="text-slate-400">Loading...</p> : items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="font-semibold">{item.name}</p>
            <p className="mt-2 text-sm text-slate-400">Calories {item.calories} • Protein {item.protein}g • Carbs {item.carbs}g • Fat {item.fat}g</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => { setEditingId(item._id || item.id); setForm({ name: item.name, calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat }); setShowForm(true); }} className="rounded-xl border border-slate-700 p-2">Edit</button>
              <button type="button" onClick={() => { api.delete(`/meals/${item._id || item.id}`).then(() => { setItems(items.filter((it) => (it._id || it.id) !== (item._id || item.id))); alert('Meal deleted'); }).catch(() => alert('Failed to delete meal')); }} className="rounded-xl border border-slate-700 p-2">Delete</button>
                <button type="button" onClick={() => { api.delete(`/meals/${item._id || item.id}`).then(() => { setItems(items.filter((it) => (it._id || it.id) !== (item._id || item.id))); toast.success('Meal deleted'); }).catch(() => toast.error('Failed to delete meal')); }} className="rounded-xl border border-slate-700 p-2">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
