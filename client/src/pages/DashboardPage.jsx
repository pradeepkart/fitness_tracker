import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { FiDroplet, FiClock, FiTarget, FiTrendingUp, FiZap, FiActivity } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

// chart data is built below from API responses

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ totalCaloriesBurned: 0, totalCaloriesIntake: 0, totalWater: 0, workoutCount: 0, mealCount: 0, progress: 0 });
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [waterInput, setWaterInput] = useState('');

  useEffect(() => {
    let mounted = true;
    api.get('/dashboard/summary')
      .then((res) => {
        if (!mounted) return;
        setSummary(res.data);
      })
      .catch(() => {});
    // also fetch workouts/meals for charts
    api.get('/workouts').then((r) => { if (mounted) setWorkouts(r.data); }).catch(() => {});
    api.get('/meals').then((r) => { if (mounted) setMeals(r.data); }).catch(() => {});
    const onProfileUpdated = () => { api.get('/dashboard/summary').then((r) => { if (mounted) setSummary(r.data); }).catch(() => {}); };
    window.addEventListener('profileUpdated', onProfileUpdated);

    return () => { mounted = false; };
  }, []);
  const stats = [
    { label: 'Calories (intake)', value: summary.totalCaloriesIntake?.toLocaleString() || '0', icon: FiZap },
    { label: 'BMI', value: (() => { const h = Number(user?.height); const w = Number(user?.weight); if (h > 0 && w > 0) { const m = h / 100; const bmi = w / (m * m); return bmi.toFixed(1); } return '—'; })(), icon: FiTarget },
    { label: 'Water', value: `${Number(summary.totalWater || 0).toFixed(1)}L`, icon: FiDroplet },
    { label: 'Workouts', value: `${summary.workoutCount || 0}`, icon: FiClock }
  ];

  // build 7-day labels from today backwards
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  };

  const days = getLast7Days();

  const dayLabels = days.map((d) => d.toLocaleDateString(undefined, { weekday: 'short' }));

  const caloriesByDay = days.map((d) => {
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).toISOString();
    const sum = (meals || []).reduce((sum, m) => {
      const md = new Date(m.date);
      if (md >= new Date(dayStart) && md <= new Date(dayEnd)) return sum + (m.calories || 0);
      return sum;
    }, 0);
    return sum;
  });

  const minutesByDay = days.map((d) => {
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).toISOString();
    const sum = (workouts || []).reduce((sum, w) => {
      const wd = new Date(w.date);
      if (wd >= new Date(dayStart) && wd <= new Date(dayEnd)) return sum + (w.duration || 0);
      return sum;
    }, 0);
    return sum;
  });

  const lineData = {
    labels: dayLabels,
    datasets: [{ label: 'Calories', data: caloriesByDay, borderColor: '#22d3ee', tension: 0.3, fill: true, backgroundColor: 'rgba(34, 211, 238, 0.12)' }]
  };

  const barData = {
    labels: dayLabels,
    datasets: [{ label: 'Workout Minutes', data: minutesByDay, backgroundColor: '#34d399' }]
  };

  const addWater = (amount) => {
    const val = Number(amount);
    if (!val || val <= 0) return;
    api.post('/water', { amount: val }).then((res) => {
      // refetch summary
      api.get('/dashboard/summary').then((r) => setSummary(r.data)).catch(() => {});
      setWaterInput('');
    }).catch(() => {});
  };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-cyan-500/20 to-slate-900 p-6">
        <p className="text-sm text-cyan-300">Welcome back</p>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Your fitness plan is on track</h2>
        <p className="mt-3 max-w-2xl text-slate-300">Review your daily progress, uncover trends, and stay motivated with AI-generated insights.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{label}</p>
              <Icon className="text-cyan-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
            {label === 'Water' && (
              <div className="mt-3 flex items-center gap-2">
                <input value={waterInput} onChange={(e) => setWaterInput(e.target.value)} placeholder="L" type="number" step="0.1" className="w-24 rounded-xl bg-slate-800 px-3 py-2" />
                <button type="button" onClick={() => addWater(waterInput)} className="rounded-xl bg-cyan-500 px-3 py-2 text-sm text-slate-950">Add</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Weekly progress</h3>
            <FiTrendingUp className="text-cyan-400" />
          </div>
          <div className="mt-4 h-64"><Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Workout minutes</h3>
            <FiActivity className="text-emerald-400" />
          </div>
          <div className="mt-4 h-64"><Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
        </div>
      </div>
    </motion.div>
  );
}
