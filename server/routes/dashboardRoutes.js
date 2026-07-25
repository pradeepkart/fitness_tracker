import express from 'express';
import { protect } from '../middleware/auth.js';
import { getMealsForUser, getWaterLogsForUser, getWorkoutsForUser } from '../utils/storage.js';

const router = express.Router();

router.get('/summary', protect, async (req, res) => {
  const workouts = await getWorkoutsForUser(req.user._id);
  const meals = await getMealsForUser(req.user._id);
  const water = await getWaterLogsForUser(req.user._id);

  const totalCaloriesBurned = workouts.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalCaloriesIntake = meals.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalWater = water.reduce((sum, item) => sum + (item.amount || 0), 0);

  res.json({
    totalCaloriesBurned,
    totalCaloriesIntake,
    totalWater,
    workoutCount: workouts.length,
    mealCount: meals.length,
    progress: Math.min(100, Math.round((totalWater / 3) * 100))
  });
});

export default router;
