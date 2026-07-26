import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiActivity, FiCoffee, FiTarget, FiCpu, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const navItems = [
  { label: 'Dashboard', path: '/', icon: FiHome },
  { label: 'Workouts', path: '/workouts', icon: FiActivity },
  { label: 'Nutrition', path: '/nutrition', icon: FiCoffee },
  { label: 'Goals', path: '/goals', icon: FiTarget },
  { label: 'AI Studio', path: '/ai', icon: FiCpu },
  { label: 'Profile', path: '/profile', icon: FiUser }
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const handleClearDemo = async () => {
    if (!confirm('Clear demo data? This will remove demo data and log you out.')) return;
    try {
      await api.get('/dev/clear');
    } catch (err) {
      // ignore errors; still log out
    }
    localStorage.removeItem('token');
    if (setUser) setUser(null);
    navigate('/login');
    // use toast for confirmation
    try { (await import('react-hot-toast')).default.success('Demo data cleared and logged out'); } catch (e) { /* fallback */ }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex">
        {open && <button aria-label="Close navigation" className="fixed inset-0 z-20 bg-slate-950/70 md:hidden" onClick={() => setOpen(false)} />}
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform ${open ? 'translate-x-0' : '-translate-x-full'} transition md:translate-x-0 bg-slate-900/95 p-6 shadow-2xl`}>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold">FitAI</h2>
            <p className="text-sm text-slate-400">Your smart fitness companion</p>
          </div>
          <nav className="space-y-2">
            {navItems.map(({ label, path, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link key={path} to={path} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${active ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-slate-800'}`}>
                  <Icon />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
            <p className="text-sm text-slate-400">Signed in as</p>
            <p className="font-medium">{user?.name || 'User'}</p>
            <button onClick={logout} className="mt-3 w-full rounded-xl bg-rose-500 px-3 py-2 text-sm">Logout</button>
            <button onClick={handleClearDemo} className="mt-2 w-full rounded-xl border border-slate-700 px-3 py-2 text-sm">Clear demo data</button>
          </div>
        </aside>

        <div className="flex-1 md:ml-64">
          <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-4 md:px-8">
              <button className="rounded-xl border border-slate-800 p-2 md:hidden" onClick={() => setOpen(!open)}>
                {open ? <FiX /> : <FiMenu />}
              </button>
              <div>
                <p className="text-sm text-slate-400">AI Fitness Tracker</p>
                <h1 className="text-xl font-semibold">Stay consistent</h1>
              </div>
              <div className="hidden rounded-full bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 md:block">
                {user?.fitnessGoal || 'Build strength'}
              </div>
            </div>
          </header>
          <main className="p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
