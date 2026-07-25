import express from 'express';
import jwt from 'jsonwebtoken';
import {
  findUserByEmail,
  createUserRecord,
  createWorkoutRecord,
  createMealRecord,
  createWaterLogRecord,
  updateGoalForUser
} from '../utils/storage.js';

const router = express.Router();

// Seed demo data for quick local testing. Returns a JWT for the demo user.
router.post('/seed', async (req, res) => {
  try {
    const email = (req.body?.email || 'demo@local').toLowerCase();
    let user = await findUserByEmail(email);

    if (!user) {
      user = await createUserRecord({
        name: 'Demo User',
        email,
        password: 'demopassword',
        age: 28,
        gender: 'Other',
        height: 175,
        weight: 75,
        fitnessGoal: 'Build strength',
        activityLevel: 'Moderate'
      });
    }

    const userId = user._id || user.id || user._id?.toString() || user.id?.toString();

    // sample workouts for the last 7 days
    const workouts = [
      { name: 'Upper Body Strength', category: 'Strength', duration: 45, calories: 320 },
      { name: 'HIIT Cardio', category: 'Cardio', duration: 25, calories: 280 },
      { name: 'Leg Day', category: 'Strength', duration: 50, calories: 420 }
    ];

    for (const w of workouts) {
      await createWorkoutRecord({ ...w, user: userId, date: new Date() });
    }

    // sample meals
    const meals = [
      { name: 'Oatmeal & Berries', calories: 350, protein: 12, carbs: 48, fat: 8 },
      { name: 'Chicken & Quinoa', calories: 540, protein: 38, carbs: 55, fat: 14 }
    ];

    for (const m of meals) {
      await createMealRecord({ ...m, user: userId, date: new Date() });
    }

    // water logs
    await createWaterLogRecord({ user: userId, amount: 1.2 });
    await createWaterLogRecord({ user: userId, amount: 1.0 });

    // goals
    await updateGoalForUser(userId, { weightGoal: '72kg', caloriesGoal: 2300, workoutGoal: 4, waterGoal: 3 });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });

    return res.json({ message: 'Demo seeded', token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Seed error', error);
    return res.status(500).json({ message: error.message });
  }
});

// GET /seed for easier calls from shells that have quoting issues
router.get('/seed', async (req, res) => {
  try {
    const email = (req.query.email || 'demo@local').toLowerCase();
    let user = await findUserByEmail(email);

    if (!user) {
      user = await createUserRecord({
        name: 'Demo User',
        email,
        password: 'demopassword',
        age: 28,
        gender: 'Other',
        height: 175,
        weight: 75,
        fitnessGoal: 'Build strength',
        activityLevel: 'Moderate'
      });
    }

    const userId = user._id || user.id || user._id?.toString() || user.id?.toString();

    const workouts = [
      { name: 'Upper Body Strength', category: 'Strength', duration: 45, calories: 320 },
      { name: 'HIIT Cardio', category: 'Cardio', duration: 25, calories: 280 },
      { name: 'Leg Day', category: 'Strength', duration: 50, calories: 420 }
    ];

    for (const w of workouts) {
      await createWorkoutRecord({ ...w, user: userId, date: new Date() });
    }

    const meals = [
      { name: 'Oatmeal & Berries', calories: 350, protein: 12, carbs: 48, fat: 8 },
      { name: 'Chicken & Quinoa', calories: 540, protein: 38, carbs: 55, fat: 14 }
    ];

    for (const m of meals) {
      await createMealRecord({ ...m, user: userId, date: new Date() });
    }

    await createWaterLogRecord({ user: userId, amount: 1.2 });
    await createWaterLogRecord({ user: userId, amount: 1.0 });

    await updateGoalForUser(userId, { weightGoal: '72kg', caloriesGoal: 2300, workoutGoal: 4, waterGoal: 3 });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });

    return res.json({ message: 'Demo seeded', token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Seed error', error);
    return res.status(500).json({ message: error.message });
  }
});

export default router;

router.get('/clear', async (req, res) => {
  try {
    const { clearDemoData } = await import('../utils/storage.js');
    clearDemoData();
    return res.json({ message: 'Demo data cleared' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
