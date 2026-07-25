import express from 'express';
import { protect } from '../middleware/auth.js';
import { createWorkoutRecord, deleteWorkoutRecord, getWorkoutsForUser, updateWorkoutRecord } from '../utils/storage.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const workouts = await getWorkoutsForUser(req.user._id);
  res.json(workouts);
});

router.post('/', protect, async (req, res) => {
  try {
    const workout = await createWorkoutRecord({ ...req.body, user: req.user._id });
    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  const workout = await updateWorkoutRecord(req.params.id, req.user._id, req.body);
  res.json(workout);
});

router.delete('/:id', protect, async (req, res) => {
  await deleteWorkoutRecord(req.params.id, req.user._id);
  res.json({ success: true });
});

export default router;
