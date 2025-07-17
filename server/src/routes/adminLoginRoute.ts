import express, { Request, Response } from 'express';
import Admin from '../models/adminModel.js';
import bcrypt from 'bcryptjs';

const router: express.Router = express.Router();

// GET /api/admin/test - בדיקת חיבור
router.get('/test', (req: Request, res: Response) => {
    console.log('Admin route test endpoint hit');
    //@ts-ignore
    (res as any).json({ message: 'Admin route is working' });
});

// POST /api/admin/login
router.post('/login', async (req: Request, res: Response) => {
    console.log('Admin login attempt:', { username: (req.body as any)?.username, hasPassword: !!(req.body as any)?.password });

    const { username, password } = (req.body as unknown) as { username: string; password: string };

    if (!username || !password) {
        console.log('Missing username or password');
        //@ts-ignore
        return (res as any).status(400).json({ message: 'יש להזין שם משתמש וסיסמה' });
    }

    try {
        const admin = await Admin.findOne({ username });
        console.log('Admin found:', !!admin);

        if (!admin) {
            console.log('Admin not found');
            //@ts-ignore
            return (res as any).status(401).json({ message: 'שם משתמש או סיסמה שגויים' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            console.log('Password does not match');
            //@ts-ignore
            return (res as any).status(401).json({ message: 'שם משתמש או סיסמה שגויים' });
        }

        console.log('Admin login successful');
        //@ts-ignore
        (res as any).json({ message: 'התחברת בהצלחה', admin: { username: admin.username, role: admin.role } });
    } catch (error) {
        console.error('Admin login error:', error);
        //@ts-ignore
        (res as any).status(500).json({ message: 'שגיאה בשרת' });
    }
});

export default router; 