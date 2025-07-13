import { Router } from 'express';
import bcrypt from 'bcryptjs';

const router = Router();

router.get('/', (req: any, res: any) => {
    res.status(200).json({ message: 'Users endpoint - בהמשך נוסיף פונקציונליות' });
});

// איפוס סיסמה למשתמש לפי אימייל (לשימוש זמני בלבד!)
router.post('/reset-password', async (req: any, res: any) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        return res.status(400).json({ message: 'חובה לספק אימייל וסיסמה חדשה' });
    }
    try {
        const user = await require('../models/userModel').default.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'משתמש לא נמצא' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ message: 'הסיסמה אופסה בהצלחה' });
    } catch (error) {
        res.status(500).json({ message: 'שגיאה באיפוס הסיסמה' });
    }
});

export default router;
