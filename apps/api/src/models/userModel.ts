import mongoose from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

// שאלות אבטחה לשחזור סיסמה
export interface ISecurityQuestion {
  question: string;
  answerHash: string;
}

// יצירת מודל משתמש עם שם, אימייל, סיסמה, בניין, דירה, שאלות אבטחה
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  apartmentNumber: { type: String },
  securityQuestions: [{
    question: { type: String, required: true },
    answerHash: { type: String, required: true }
  }]
});

userSchema.plugin(multiTenancyPlugin);
userSchema.index({ buildingId: 1, email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
export default User;
