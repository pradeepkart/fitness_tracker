import express from 'express';
import { protect } from '../middleware/auth.js';
import { getGoalForUser, updateGoalForUser } from '../utils/storage.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const goal = await getGoalForUser(req.user._id);
  res.json(goal);
});

router.put('/', protect, async (req, res) => {
  const goal = await updateGoalForUser(req.user._id, req.body);
  res.json(goal);
});

export default router;
