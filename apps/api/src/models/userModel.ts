import mongoose from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

// יצירת מודל משתמש עם שם, אימייל, סיסמה, בניין, דירה
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  apartmentNumber: { type: String },
});

userSchema.plugin(multiTenancyPlugin);
userSchema.index({ buildingId: 1, email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
export default User;
