import express from 'express';
import dotenv from 'dotenv';
import { protect } from '../middleware/auth.js';
import OpenAI from 'openai';

dotenv.config();

const router = express.Router();

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

router.post('/generate', protect, async (req, res) => {
  try {
    const openai = getOpenAIClient();
    if (!openai) {
      return res.json({ message: 'AI suggestion: keep your protein high, hydrate well, and train 4-5 times this week.' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: 'You are a concise fitness coach.' }, { role: 'user', content: req.body.prompt || 'Create a balanced fitness plan' }],
      temperature: 0.7
    });

    res.json({ message: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
