import jwt from 'jsonwebtoken';
import { findUserByIdWithPassword } from '../utils/storage.js';

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    const user = await findUserByIdWithPassword(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
