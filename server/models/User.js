import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  age: { type: Number, default: 0 },
  gender: { type: String, default: 'Other' },
  height: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  fitnessGoal: { type: String, default: 'Stay active' },
  activityLevel: { type: String, default: 'Moderate' },
  profilePicture: { type: String, default: '' },
  caloriesGoal: { type: Number, default: 2200 },
  waterGoal: { type: Number, default: 3 },
  workoutGoal: { type: Number, default: 5 },
  weeklyProgress: { type: Array, default: [] }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
