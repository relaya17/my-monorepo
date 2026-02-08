import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import { loginRateLimiter } from '../middleware/securityMiddleware.js';

const router = express.Router();

const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 6) return { isValid: false, message: 'הסיסמה חייבת להיות לפחות 6 תווים' };
  if (password.length > 50) return { isValid: false, message: 'הסיסמה לא יכולה להיות יותר מ-50 תווים' };
  return { isValid: true, message: '' };
};

// POST /api/forgot-password/questions – מחזיר שאלות אבטחה לפי אימייל (בהתאם ל-buildingId מהבקשה)
router.post('/questions', loginRateLimiter, async (req: Request, res: Response) => {
  const body = req.body as { email?: string };
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: 'אנא הזן כתובת אימייל תקינה', field: 'email' });
  }

  try {
    const user = await User.findOne({ email }).select('securityQuestions');
    if (!user) {
      return res.status(404).json({ message: 'משתמש לא נמצא בבניין הנבחר', field: 'email' });
    }
    if (!user.securityQuestions || user.securityQuestions.length === 0) {
      return res.status(400).json({
        message: 'לא הוגדרו שאלות אבטחה עבור חשבון זה. פנה לאדמין לאפס את הסיסמה.',
        field: 'email'
      });
    }
    const questions = user.securityQuestions.map((q: { question: string }) => q.question);
    return res.json({ questions });
  } catch (error) {
    console.error('Forgot password questions error:', error);
    return res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

// POST /api/forgot-password/reset – איפוס סיסמה לאחר אימות שאלות אבטחה
router.post('/reset', loginRateLimiter, async (req: Request, res: Response) => {
  const body = req.body as {
    email?: string;
    answers?: string[];
    newPassword?: string;
  };
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const answers = Array.isArray(body.answers) ? body.answers.map((a) => String(a || '').trim()) : [];
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword.trim() : '';

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: 'אנא הזן כתובת אימייל תקינה', field: 'email' });
  }
  const pwValidation = validatePassword(newPassword);
  if (!pwValidation.isValid) {
    return res.status(400).json({ message: pwValidation.message, field: 'newPassword' });
  }
  if (answers.length === 0) {
    return res.status(400).json({ message: 'חובה לענות על שאלות האבטחה', field: 'answers' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'משתמש לא נמצא בבניין הנבחר', field: 'email' });
    }
    if (!user.securityQuestions || user.securityQuestions.length === 0) {
      return res.status(400).json({
        message: 'לא הוגדרו שאלות אבטחה עבור חשבון זה.',
        field: 'email'
      });
    }
    const questions = user.securityQuestions as { question: string; answerHash: string }[];
    if (answers.length < questions.length) {
      return res.status(400).json({
        message: 'חובה לענות על כל שאלות האבטחה',
        field: 'answers'
      });
    }
    for (let i = 0; i < questions.length; i++) {
      const match = await bcrypt.compare(answers[i], questions[i].answerHash);
      if (!match) {
        return res.status(401).json({ message: 'תשובות לשאלות האבטחה שגויות', field: 'answers' });
      }
    }
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    // כאן ניתן להוסיף שליחת מייל אישור (דורש שירות אימייל)
    // await sendPasswordChangedEmail(user.email);

    return res.json({ message: 'הסיסמה שונתה בהצלחה. ניתן להתחבר עם הסיסמה החדשה.' });
  } catch (error) {
    console.error('Forgot password reset error:', error);
    return res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

export default router;
