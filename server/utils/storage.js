import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const memoryStore = {
  users: [],
  workouts: [],
  meals: [],
  goals: [],
  waterLogs: []
};

let connectionPromise;

/**
 * Reuse one Mongoose connection across serverless invocations.  A module-level
 * promise prevents parallel requests from opening multiple connections.
 */
export async function isDbConnected() {
  if (mongoose.connection.readyState === 1) return true;

  const connectionString = process.env.MONGODB_URI;
  if (!connectionString) return false;

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 10000
    }).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  await connectionPromise;
  return mongoose.connection.readyState === 1;
}

export function getMemoryStore() {
  return memoryStore;
}

export async function createUserRecord(data) {
  if (await isDbConnected()) {
    const User = (await import('../models/User.js')).default;
    return User.create(data);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = {
    _id: `${Date.now()}`,
    ...data,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comparePassword: async function (candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    }
  };
  memoryStore.users.push(user);
  return user;
}

export async function findUserByEmail(email) {
  if (await isDbConnected()) {
    const User = (await import('../models/User.js')).default;
    return User.findOne({ email });
  }

  return memoryStore.users.find((user) => user.email === email.toLowerCase()) || null;
}

export async function findUserById(id) {
  if (await isDbConnected()) {
    const User = (await import('../models/User.js')).default;
    return User.findById(id).select('-password');
  }

  const user = memoryStore.users.find((entry) => entry._id.toString() === id.toString());
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function findUserByIdWithPassword(id) {
  if (await isDbConnected()) {
    const User = (await import('../models/User.js')).default;
    return User.findById(id);
  }

  return memoryStore.users.find((entry) => entry._id.toString() === id.toString()) || null;
}

export async function updateUserRecord(id, updates) {
  if (await isDbConnected()) {
    const User = (await import('../models/User.js')).default;
    return User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
  }

  const user = memoryStore.users.find((entry) => entry._id.toString() === id.toString());
  if (!user) return null;
  Object.assign(user, updates, { updatedAt: new Date().toISOString() });
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function getWorkoutsForUser(userId) {
  if (await isDbConnected()) {
    const Workout = (await import('../models/Workout.js')).default;
    return Workout.find({ user: userId }).sort({ date: -1 });
  }

  return memoryStore.workouts.filter((item) => item.user.toString() === userId.toString()).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function createWorkoutRecord(data) {
  if (await isDbConnected()) {
    const Workout = (await import('../models/Workout.js')).default;
    return Workout.create(data);
  }

  const workout = { _id: `${Date.now()}`, ...data, date: data.date || new Date().toISOString() };
  memoryStore.workouts.push(workout);
  return workout;
}

export async function updateWorkoutRecord(id, userId, updates) {
  if (await isDbConnected()) {
    const Workout = (await import('../models/Workout.js')).default;
    return Workout.findOneAndUpdate({ _id: id, user: userId }, updates, { new: true });
  }

  const workout = memoryStore.workouts.find((item) => item._id.toString() === id.toString() && item.user.toString() === userId.toString());
  if (!workout) return null;
  Object.assign(workout, updates);
  return workout;
}

export async function deleteWorkoutRecord(id, userId) {
  if (await isDbConnected()) {
    const Workout = (await import('../models/Workout.js')).default;
    return Workout.deleteOne({ _id: id, user: userId });
  }

  memoryStore.workouts = memoryStore.workouts.filter((item) => !(item._id.toString() === id.toString() && item.user.toString() === userId.toString()));
  return { success: true };
}

export async function getMealsForUser(userId) {
  if (await isDbConnected()) {
    const Meal = (await import('../models/Meal.js')).default;
    return Meal.find({ user: userId }).sort({ date: -1 });
  }

  return memoryStore.meals.filter((item) => item.user.toString() === userId.toString()).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function createMealRecord(data) {
  if (await isDbConnected()) {
    const Meal = (await import('../models/Meal.js')).default;
    return Meal.create(data);
  }

  const meal = { _id: `${Date.now()}`, ...data, date: data.date || new Date().toISOString() };
  memoryStore.meals.push(meal);
  return meal;
}

export async function deleteMealRecord(id, userId) {
  if (await isDbConnected()) {
    const Meal = (await import('../models/Meal.js')).default;
    return Meal.deleteOne({ _id: id, user: userId });
  }

  memoryStore.meals = memoryStore.meals.filter((item) => !(item._id.toString() === id.toString() && item.user.toString() === userId.toString()));
  return { success: true };
}

export async function updateMealRecord(id, userId, updates) {
  if (await isDbConnected()) {
    const Meal = (await import('../models/Meal.js')).default;
    return Meal.findOneAndUpdate({ _id: id, user: userId }, updates, { new: true });
  }

  const meal = memoryStore.meals.find((item) => item._id.toString() === id.toString() && item.user.toString() === userId.toString());
  if (!meal) return null;
  Object.assign(meal, updates);
  return meal;
}

export async function getGoalForUser(userId) {
  if (await isDbConnected()) {
    const Goal = (await import('../models/Goal.js')).default;
    let goal = await Goal.findOne({ user: userId });
    if (!goal) goal = await Goal.create({ user: userId });
    return goal;
  }

  let goal = memoryStore.goals.find((item) => item.user.toString() === userId.toString());
  if (!goal) {
    goal = { _id: `${Date.now()}`, user: userId, weightGoal: '68kg', caloriesGoal: 2200, workoutGoal: 5, waterGoal: 3, completed: false };
    memoryStore.goals.push(goal);
  }
  return goal;
}

export async function updateGoalForUser(userId, updates) {
  if (await isDbConnected()) {
    const Goal = (await import('../models/Goal.js')).default;
    return Goal.findOneAndUpdate({ user: userId }, updates, { new: true, upsert: true });
  }

  let goal = memoryStore.goals.find((item) => item.user.toString() === userId.toString());
  if (!goal) {
    goal = { _id: `${Date.now()}`, user: userId, weightGoal: '68kg', caloriesGoal: 2200, workoutGoal: 5, waterGoal: 3, completed: false };
    memoryStore.goals.push(goal);
  }
  Object.assign(goal, updates);
  return goal;
}

export async function getWaterLogsForUser(userId) {
  if (await isDbConnected()) {
    const WaterLog = (await import('../models/WaterLog.js')).default;
    return WaterLog.find({ user: userId }).sort({ date: -1 });
  }

  return memoryStore.waterLogs.filter((item) => item.user.toString() === userId.toString()).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function createWaterLogRecord(data) {
  if (await isDbConnected()) {
    const WaterLog = (await import('../models/WaterLog.js')).default;
    return WaterLog.create(data);
  }

  const log = { _id: `${Date.now()}`, ...data, date: data.date || new Date().toISOString() };
  memoryStore.waterLogs.push(log);
  return log;
}

export function clearDemoData() {
  memoryStore.users = [];
  memoryStore.workouts = [];
  memoryStore.meals = [];
  memoryStore.goals = [];
  memoryStore.waterLogs = [];
}
