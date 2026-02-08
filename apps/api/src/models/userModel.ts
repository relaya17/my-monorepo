import mongoose from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

// יצירת מודל משתמש עם שם, אימייל, סיסמה
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.plugin(multiTenancyPlugin);

const User = mongoose.model('User', userSchema);
export default User;
