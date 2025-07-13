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

router.post('/', async (req: any, res: any) => {
    const { email, password } = req.body as { email: string; password: string };

    try {
        // ולידציה לאימייל
        if (!email || !validateEmail(email)) {
            return res.status(400).json({
                message: 'אנא הזן כתובת אימייל תקינה',
                field: 'email'
            });
        }

        // ולידציה לסיסמה
        const passwordValidation = validatePassword(password);
        if (!password || !passwordValidation.isValid) {
            return res.status(400).json({
                message: passwordValidation.message || 'אנא הזן סיסמה',
                field: 'password'
            });
        }

        // חיפוש המשתמש במסד הנתונים (תיקון: lowercase + trim)
        const normalizedEmail = email.toLowerCase().trim();
        console.log('=== LOGIN DEBUG ===');
        console.log('Original email:', email);
        console.log('Normalized email:', normalizedEmail);

        const user = await User.findOne({ email: normalizedEmail });
        console.log('User found:', user ? 'Yes' : 'No');
        if (user) {
            console.log('User email in DB:', user.email);
            console.log('User name:', user.name);
        }

        if (!user) {
            return res.status(401).json({
                message: 'אימייל או סיסמה שגויים',
                field: 'general'
            });
        }

        // השוואת הסיסמה
        console.log('Comparing passwords...');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'אימייל או סיסמה שגויים',
                field: 'general'
            });
        }

        // לוגין מוצלח
        return res.status(200).json({
            message: 'התחברת בהצלחה',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error: any) {
        console.error('Error during login:', error);
        return res.status(500).json({
            message: 'שגיאה בשרת, אנא נסה שוב',
            field: 'general'
        });
    }
});

export default router; 