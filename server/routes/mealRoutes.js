import express from 'express';
import { protect } from '../middleware/auth.js';
import { createMealRecord, deleteMealRecord, getMealsForUser, updateMealRecord } from '../utils/storage.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const meals = await getMealsForUser(req.user._id);
  res.json(meals);
});

router.post('/', protect, async (req, res) => {
  try {
    const meal = await createMealRecord({ ...req.body, user: req.user._id });
    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const meal = await updateMealRecord(req.params.id, req.user._id, req.body);
    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  await deleteMealRecord(req.params.id, req.user._id);
  res.json({ success: true });
});

export default router;
