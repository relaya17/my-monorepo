import express, { Request, Response } from 'express';
import Admin from '../models/adminModel.js';
import bcrypt from 'bcryptjs';
import { loginRateLimiter } from '../middleware/securityMiddleware.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';

const router: express.Router = express.Router();

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/admin/test - בדיקת חיבור
router.get('/test', (req: Request, res: Response) => {
    console.log('Admin route test endpoint hit');
    res.json({ message: 'Admin route is working' });
});

// POST /api/admin/login
router.post('/login', loginRateLimiter, async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const usernameRaw = typeof body.username === 'string' ? body.username : undefined;
    const passwordRaw = typeof body.password === 'string' ? body.password : undefined;

    const username = usernameRaw?.trim();
    const password = passwordRaw?.trim();

    console.log('Admin login attempt:', { username, hasPassword: Boolean(password) });

    if (!username || !password) {
        console.log('Missing username or password');
        return res.status(400).json({ message: 'יש להזין שם משתמש וסיסמה' });
    }

    try {
        // אדמין תמיד ב-buildingId default – חיפוש ב-default גם אם נשלח x-building-id אחר
        const admin = await tenantContext.run({ buildingId: 'default' }, async () =>
            Admin.findOne({ username: new RegExp(`^${escapeRegex(username)}$`, 'i') })
        );
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