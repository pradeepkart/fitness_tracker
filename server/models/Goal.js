import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weightGoal: { type: String, default: '68kg' },
  caloriesGoal: { type: Number, default: 2200 },
  workoutGoal: { type: Number, default: 5 },
  waterGoal: { type: Number, default: 3 },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Goal', goalSchema);
