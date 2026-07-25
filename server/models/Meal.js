import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Meal', mealSchema);
