import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const AuthContext = createContext(null);
const LOCAL_ACCOUNT_KEY = 'fitai_local_account';
const LOCAL_SESSION_KEY = 'fitai_local_session';

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

    // Tokens created by the previous serverless fallback cannot survive a
    // function restart. Clear any old token quietly instead of creating a 401.
    localStorage.removeItem('token');
    setLoading(false);
  }, []);

  const login = async () => {
    throw new Error('No matching account was found on this device. Please register again or use the account details you created here.');
  };

  const createLocalAccount = async (payload) => {
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
    localStorage.setItem('fitai_local_tracker', JSON.stringify({}));
    localStorage.removeItem('token');
    setIsLocalAccount(true);
    setUser(publicUser(account));
    return { user: publicUser(account) };
  };

  const register = async (payload) => {
    const existingAccount = readLocalAccount();
    if (existingAccount?.email === payload.email.trim().toLowerCase()) {
      throw new Error('An account with this email already exists on this device. Please log in instead.');
    }
    if (existingAccount) {
      throw new Error('Another account is already saved on this device. Please log in or clear it before creating a new account.');
    }
    return createLocalAccount(payload);
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

  const useDemoAccount = async () => {
    const account = readLocalAccount();
    if (account?.email === 'demo@local') return loginWithLocalAccount('demo@local', 'demopassword');
    if (account) throw new Error('Please log out of your account before using the demo account.');
    await createLocalAccount({ name: 'Demo User', email: 'demo@local', password: 'demopassword', age: 28, gender: 'Other' });
    return true;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setIsLocalAccount(false);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, loginWithLocalAccount, register, logout, setUser, isLocalAccount, updateLocalProfile, useDemoAccount }), [user, loading, isLocalAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
