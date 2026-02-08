import mongoose from 'mongoose';

// יצירת מודל משתמש עם שם, אימייל, סיסמה
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);
export default User;
