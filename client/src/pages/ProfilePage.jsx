import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: authUser, isLocalAccount, updateLocalProfile } = useAuth();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (isLocalAccount) {
        if (mounted) setProfile(authUser);
        if (mounted) setLoading(false);
        return;
      }
      try {
        const res = await api.get('/users/profile');
        if (mounted) setProfile(res.data.user);
      } catch (err) {
        try {
          const alt = await api.get('/auth/me');
          if (mounted) setProfile(alt.data.user);
        } catch (e) {
          if (mounted && authUser) setProfile(authUser);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [authUser, isLocalAccount]);

  const save = (updates) => {
    if (isLocalAccount) {
      const updatedUser = updateLocalProfile(updates);
      setProfile(updatedUser);
      window.dispatchEvent(new Event('profileUpdated'));
      return;
    }
    api.put('/users/profile', updates).then((res) => { setProfile(res.data.user); try { window.dispatchEvent(new Event('profileUpdated')); } catch (e) {} }).catch(() => toast.error('Failed to save profile'));
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { save({ profilePicture: reader.result }); };
    reader.readAsDataURL(file);
  };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 className="text-2xl font-semibold">Profile</h2>
        <p className="text-slate-400">Manage your personal health information and settings.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {loading ? <p className="text-slate-400">Loading...</p> : (
            <>
              <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-4">
                <p className="text-sm text-slate-400">Name</p>
                <input className="mt-2 w-full rounded-xl bg-slate-900 px-3 py-2" defaultValue={profile?.name} onBlur={(e) => save({ name: e.target.value })} />
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-4">
                <p className="text-sm text-slate-400">Email</p>
                <p className="mt-2 break-all text-sm font-semibold leading-6">{profile?.email}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-4">
                <p className="text-sm text-slate-400">Height (cm)</p>
                <input className="mt-2 w-full rounded-xl bg-slate-900 px-3 py-2" type="number" defaultValue={profile?.height} onBlur={(e) => save({ height: Number(e.target.value) })} />
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-4">
                <p className="text-sm text-slate-400">Weight (kg)</p>
                <input className="mt-2 w-full rounded-xl bg-slate-900 px-3 py-2" type="number" defaultValue={profile?.weight} onBlur={(e) => save({ weight: Number(e.target.value) })} />
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-4 md:col-span-2">
                <p className="text-sm text-slate-400">Profile Picture</p>
                <div className="mt-2 flex items-center gap-3">
                  <input type="file" accept="image/*" onChange={handleUpload} />
                  {profile?.profilePicture && <img src={profile.profilePicture} alt="avatar" className="h-12 w-12 rounded-full" />}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
