import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const LOCAL_ACCOUNT_KEY = 'fitai_local_account';
const LOCAL_SESSION_KEY = 'fitai_local_session';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

const readLocalAccount = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ACCOUNT_KEY));
  } catch {
    localStorage.removeItem(LOCAL_ACCOUNT_KEY);
    return null;
  }
};

const publicUser = ({ passwordHash, ...account }) => account;

const hashPassword = async (password) => {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLocalAccount, setIsLocalAccount] = useState(false);

  useEffect(() => {
    const localAccount = readLocalAccount();
    if (localStorage.getItem(LOCAL_SESSION_KEY) === 'true' && localAccount) {
      setUser(publicUser(localAccount));
      setIsLocalAccount(true);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setIsLocalAccount(false);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    const account = {
      id: `local-${crypto.randomUUID()}`,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      age: Number(payload.age) || 0,
      gender: payload.gender,
      height: 0,
      weight: 0,
      fitnessGoal: 'Stay active',
      activityLevel: 'Moderate',
      passwordHash: await hashPassword(payload.password)
    };

    // Keep an on-device session as well. This prevents serverless restarts from
    // logging a newly registered visitor out while a database is being connected.
    localStorage.setItem(LOCAL_ACCOUNT_KEY, JSON.stringify(account));
    localStorage.setItem(LOCAL_SESSION_KEY, 'true');
    localStorage.removeItem('token');
    setIsLocalAccount(true);
    setUser(publicUser(account));
    return { ...res.data, user: publicUser(account) };
  };

  const loginWithLocalAccount = async (email, password) => {
    const account = readLocalAccount();
    if (!account || account.email !== email.trim().toLowerCase() || account.passwordHash !== await hashPassword(password)) {
      return false;
    }
    localStorage.setItem(LOCAL_SESSION_KEY, 'true');
    localStorage.removeItem('token');
    setIsLocalAccount(true);
    setUser(publicUser(account));
    return true;
  };

  const updateLocalProfile = (updates) => {
    const account = readLocalAccount();
    if (!account) return null;
    const updatedAccount = { ...account, ...updates };
    localStorage.setItem(LOCAL_ACCOUNT_KEY, JSON.stringify(updatedAccount));
    const updatedUser = publicUser(updatedAccount);
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setIsLocalAccount(false);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, loginWithLocalAccount, register, logout, setUser, isLocalAccount, updateLocalProfile }), [user, loading, isLocalAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
