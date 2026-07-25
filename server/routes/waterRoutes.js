import express from 'express';
import { protect } from '../middleware/auth.js';
import { createWaterLogRecord, getWaterLogsForUser } from '../utils/storage.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const logs = await getWaterLogsForUser(req.user._id);
  res.json(logs);
});

router.post('/', protect, async (req, res) => {
  const log = await createWaterLogRecord({ ...req.body, user: req.user._id });
  res.status(201).json(log);
});

export default router;
