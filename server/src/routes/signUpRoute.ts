import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userModel';

const router: express.Router = express.Router();

// ולידציה לאימייל
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ולידציה לסיסמה
const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'הסיסמה חייבת להיות לפחות 6 תווים' };
  }
  if (password.length > 50) {
    return { isValid: false, message: 'הסיסמה לא יכולה להיות יותר מ-50 תווים' };
  }
  return { isValid: true, message: '' };
};

// ולידציה לשם
const validateName = (name: string): { isValid: boolean; message: string } => {
  if (!name || name.trim().length < 2) {
    return { isValid: false, message: 'השם חייב להיות לפחות 2 תווים' };
  }
  if (name.trim().length > 50) {
    return { isValid: false, message: 'השם לא יכול להיות יותר מ-50 תווים' };
  }
  return { isValid: true, message: '' };
};

router.post('/', async (req: any, res: any) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  try {
    // ולידציה לשם
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      return res.status(400).json({
        message: nameValidation.message,
        field: 'name'
      });
    }

    // ולידציה לאימייל
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        message: 'אנא הזן כתובת אימייל תקינה',
        field: 'email'
      });
    }

    // ולידציה לסיסמה
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: passwordValidation.message,
        field: 'password'
      });
    }

    // בדיקה אם המשתמש כבר קיים
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        message: 'משתמש עם אימייל זה כבר קיים',
        field: 'email'
      });
    }

    // יצירת הסיסמה המוצפנת
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // יצירת המשתמש החדש
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });
    await newUser.save();

    return res.status(201).json({
      message: 'משתמש נוצר בהצלחה',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      message: 'שגיאה ביצירת משתמש, אנא נסה שוב',
      field: 'general'
    });
  }
});

export default router;
