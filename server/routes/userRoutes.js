import express from 'express';
import { protect } from '../middleware/auth.js';
import { updateUserRecord } from '../utils/storage.js';

const router = express.Router();

router.get('/profile', protect, async (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', protect, async (req, res) => {
  try {
    const updates = req.body;
    const user = await updateUserRecord(req.user._id, updates);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
