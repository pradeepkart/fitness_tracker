import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import api from '../services/api';

const goals = [
  { label: 'Weight Goal', value: '68 kg' },
  { label: 'Calories Goal', value: '2,100 kcal' },
  { label: 'Workout Goal', value: '5x/week' },
  { label: 'Water Goal', value: '3.5L/day' }
];

export default function GoalsPage() {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/goals').then((res) => { if (mounted) setGoal(res.data); }).catch(() => {}).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const save = (updates) => {
    api.put('/goals', updates).then((res) => setGoal(res.data)).catch(() => {});
  };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 className="text-2xl font-semibold">Goals & Targets</h2>
        <p className="text-slate-400">Set targets and track your progress toward them.</p>
      </div>
      {loading ? <p className="text-slate-400">Loading...</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Weight Goal</p>
            <p className="mt-2 text-2xl font-semibold">{goal?.weightGoal}</p>
            <input className="mt-3 w-full rounded-xl bg-slate-800 px-3 py-2" defaultValue={goal?.weightGoal} onBlur={(e) => save({ weightGoal: e.target.value })} />
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Calories Goal</p>
            <p className="mt-2 text-2xl font-semibold">{goal?.caloriesGoal} kcal</p>
            <input className="mt-3 w-full rounded-xl bg-slate-800 px-3 py-2" type="number" defaultValue={goal?.caloriesGoal} onBlur={(e) => save({ caloriesGoal: Number(e.target.value) })} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
