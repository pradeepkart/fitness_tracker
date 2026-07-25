import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, default: 'Strength' },
  duration: { type: Number, required: true },
  calories: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Workout', workoutSchema);
