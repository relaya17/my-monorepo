import express, { Request, Response } from 'express';
import Admin from '../models/adminModel.js';
import bcrypt from 'bcryptjs';

const router: express.Router = express.Router();

// GET /api/admin/test - בדיקת חיבור
router.get('/test', (req: Request, res: Response) => {
    console.log('Admin route test endpoint hit');
    res.json({ message: 'Admin route is working' });
});

// POST /api/admin/login
router.post('/login', async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const username = body.username as string | undefined;
    const password = body.password as string | undefined;
    console.log('Admin login attempt:', { username, hasPassword: Boolean(password) });

    if (!username || !password) {
        console.log('Missing username or password');
        return res.status(400).json({ message: 'יש להזין שם משתמש וסיסמה' });
    }

    try {
        const admin = await Admin.findOne({ username });
        console.log('Admin found:', !!admin);

        if (!admin) {
            console.log('Admin not found');
            return res.status(401).json({ message: 'שם משתמש או סיסמה שגויים' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            console.log('Password does not match');
            return res.status(401).json({ message: 'שם משתמש או סיסמה שגויים' });
        }

        console.log('Admin login successful');
        res.json({ message: 'התחברת בהצלחה', admin: { username: admin.username, role: admin.role } });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'שגיאה בשרת' });
    }
});

export default router; 