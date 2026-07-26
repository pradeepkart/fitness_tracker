import axios from 'axios';

const LOCAL_SESSION_KEY = 'fitai_local_session';
const LOCAL_ACCOUNT_KEY = 'fitai_local_account';
const LOCAL_DATA_KEY = 'fitai_local_tracker';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

const isLocalSession = () => localStorage.getItem(LOCAL_SESSION_KEY) === 'true';
const readJson = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const writeJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const defaultData = () => ({
  workouts: [],
  meals: [],
  waterLogs: [],
  goal: { weightGoal: '68 kg', caloriesGoal: 2200, workoutGoal: 5, waterGoal: 3, completed: false }
});
const readData = () => ({ ...defaultData(), ...readJson(LOCAL_DATA_KEY, {}) });
const parseBody = (data) => typeof data === 'string' ? JSON.parse(data || '{}') : (data || {});
const publicAccount = (account) => {
  if (!account) return null;
  const { passwordHash, ...user } = account;
  return user;
};

const localAdapter = async (config) => {
  const method = (config.method || 'get').toLowerCase();
  const path = (config.url || '').split('?')[0];
  const body = parseBody(config.data);
  const store = readData();
  let data;

  if (path === '/users/profile' && method === 'put') {
    const account = { ...readJson(LOCAL_ACCOUNT_KEY, {}), ...body };
    writeJson(LOCAL_ACCOUNT_KEY, account);
    data = { user: publicAccount(account) };
  } else if (path === '/auth/me' || path === '/users/profile') {
    data = { user: publicAccount(readJson(LOCAL_ACCOUNT_KEY, null)) };
  } else if (path === '/workouts') {
    if (method === 'get') data = store.workouts;
    if (method === 'post') {
      const item = { _id: newId(), ...body, date: new Date().toISOString() };
      store.workouts.unshift(item); writeJson(LOCAL_DATA_KEY, store); data = item;
    }
  } else if (path.startsWith('/workouts/')) {
    const id = path.split('/').pop();
    if (method === 'put') {
      const index = store.workouts.findIndex((item) => (item._id || item.id) === id);
      store.workouts[index] = { ...store.workouts[index], ...body }; writeJson(LOCAL_DATA_KEY, store); data = store.workouts[index];
    }
    if (method === 'delete') { store.workouts = store.workouts.filter((item) => (item._id || item.id) !== id); writeJson(LOCAL_DATA_KEY, store); data = { success: true }; }
  } else if (path === '/meals') {
    if (method === 'get') data = store.meals;
    if (method === 'post') { const item = { _id: newId(), ...body, date: new Date().toISOString() }; store.meals.unshift(item); writeJson(LOCAL_DATA_KEY, store); data = item; }
  } else if (path.startsWith('/meals/')) {
    const id = path.split('/').pop();
    if (method === 'put') { const index = store.meals.findIndex((item) => (item._id || item.id) === id); store.meals[index] = { ...store.meals[index], ...body }; writeJson(LOCAL_DATA_KEY, store); data = store.meals[index]; }
    if (method === 'delete') { store.meals = store.meals.filter((item) => (item._id || item.id) !== id); writeJson(LOCAL_DATA_KEY, store); data = { success: true }; }
  } else if (path === '/goals') {
    if (method === 'get') data = store.goal;
    if (method === 'put') { store.goal = { ...store.goal, ...body }; writeJson(LOCAL_DATA_KEY, store); data = store.goal; }
  } else if (path === '/water' && method === 'post') {
    const item = { _id: newId(), amount: Number(body.amount), date: new Date().toISOString() };
    store.waterLogs.unshift(item); writeJson(LOCAL_DATA_KEY, store); data = item;
  } else if (path === '/dashboard/summary') {
    const sum = (items, field) => items.reduce((total, item) => total + Number(item[field] || 0), 0);
    const totalWater = sum(store.waterLogs, 'amount');
    data = { totalCaloriesBurned: sum(store.workouts, 'calories'), totalCaloriesIntake: sum(store.meals, 'calories'), totalWater, workoutCount: store.workouts.length, mealCount: store.meals.length, progress: Math.min(100, Math.round((totalWater / Number(store.goal.waterGoal || 3)) * 100)) };
  } else if (path === '/ai/generate' && method === 'post') {
    data = { message: 'AI insights require the production AI service. Your prompt has not been sent.' };
  } else {
    data = {};
  }

  return { data, status: 200, statusText: 'OK', headers: {}, config, request: null };
};

api.interceptors.request.use((config) => {
  if (isLocalSession()) {
    config.adapter = localAdapter;
    return config;
  }
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
