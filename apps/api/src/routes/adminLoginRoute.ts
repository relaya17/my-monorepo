import express, { Request, Response } from 'express';
import Admin from '../models/adminModel.js';
import RefreshToken from '../models/refreshTokenModel.js';
import bcrypt from 'bcryptjs';
import { loginRateLimiter } from '../middleware/securityMiddleware.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { createAccessToken, createRefreshTokenValue, getRefreshExpiresDate } from '../utils/jwt.js';

const router: express.Router = express.Router();

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/admin/test - בדיקת חיבור
router.get('/test', (req: Request, res: Response) => {
    res.json({ message: 'Admin route is working' });
});

// GET /api/admin/check - בדיקה אם יש אדמין רשום (ללא פרטים)
router.get('/check', async (_req: Request, res: Response) => {
    try {
        const count = await Admin.collection.countDocuments({});
        res.json({ hasAdmin: count > 0, count });
    } catch (err) {
        res.status(500).json({ hasAdmin: false, error: 'שגיאה בבדיקה' });
    }
});

// POST /api/admin/register - רישום אדמין חדש (לבדיקות)
router.post('/register', loginRateLimiter, async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password.trim() : '';

    if (!username || !password) {
        return res.status(400).json({ message: 'יש להזין שם משתמש וסיסמה' });
    }

    try {
        const created = await tenantContext.run({ buildingId: 'default' }, async () => {
            const existing = await Admin.findOne({ username: new RegExp(`^${escapeRegex(username)}$`, 'i') });
            if (existing) return false;
            const hash = await bcrypt.hash(password, 10);
            await Admin.create({ username, password: hash, role: 'admin' });
            return true;
        });
        if (!created) return res.status(409).json({ message: 'שם משתמש כבר קיים' });
        res.status(201).json({ message: 'אדמין נוצר בהצלחה', username });
    } catch (err) {
        console.error('Admin register error:', err);
        res.status(500).json({ message: 'שגיאה בשרת' });
    }
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
        let admin: { password?: string; username?: string; role?: string } | null = await tenantContext.run(
            { buildingId: 'default' },
            async () => Admin.findOne({ username: new RegExp(`^${escapeRegex(username)}$`, 'i') })
        );
        // Fallback: חיפוש ישיר ב-collection (עוקף plugin) – מוצא אדמין בכל buildingId
        if (!admin) {
            const raw = await Admin.collection.findOne({
                username: { $regex: new RegExp(`^${escapeRegex(username)}$`, 'i') }
            });
            if (raw) admin = raw as { password?: string; username?: string; role?: string };
        }
        console.log('Admin found:', !!admin);

        if (!admin) {
            console.log('Admin not found');
            return res.status(401).json({ message: 'שם משתמש או סיסמה שגויים' });
        }

        const pwd = admin.password;
        const isMatch = typeof pwd === 'string' && (await bcrypt.compare(password, pwd));
        console.log('Password match:', isMatch);

        if (!isMatch) {
            console.log('Password does not match');
            return res.status(401).json({ message: 'שם משתמש או סיסמה שגויים' });
        }

        const usernameOut = admin.username ?? '';
        const roleOut = admin.role ?? 'admin';
        const adminId = (admin as { _id?: { toString(): string } })._id?.toString() ?? usernameOut;
        const buildingId = 'default';
        const accessToken = createAccessToken({ sub: adminId, type: 'admin', buildingId, username: usernameOut, role: roleOut });
        const { token: refreshToken, hash: tokenHash } = createRefreshTokenValue();
        const expiresAt = getRefreshExpiresDate();
        await RefreshToken.create({ subject: adminId, type: 'admin', buildingId, tokenHash, expiresAt });

        res.json({
            message: 'התחברת בהצלחה',
            admin: { username: usernameOut, role: roleOut },
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'שגיאה בשרת' });
    }
});

// POST /api/admin/change-password – שינוי סיסמת אדמין (דורש JWT)
router.post('/change-password', authMiddleware, loginRateLimiter, async (req: Request, res: Response) => {
    const auth = (req as Request & { auth?: { sub: string; type: string; username?: string } }).auth;
    if (!auth || auth.type !== 'admin') {
        return res.status(403).json({ message: 'גישה לאדמינים בלבד' });
    }
    const body = req.body as Record<string, unknown>;
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword.trim() : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword.trim() : '';

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'יש להזין סיסמה נוכחית וסיסמה חדשה' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'הסיסמה החדשה חייבת להכיל לפחות 6 תווים' });
    }

    try {
        let admin: { _id?: { toString(): string }; password?: string; username?: string } | null = await tenantContext.run(
            { buildingId: 'default' },
            async () => Admin.findById(auth.sub)
        );
        if (!admin) {
            const raw = await Admin.collection.findOne({ _id: auth.sub } as Record<string, unknown>);
            if (raw) admin = raw as { _id?: { toString(): string }; password?: string; username?: string };
        }
        if (!admin) {
            return res.status(404).json({ message: 'אדמין לא נמצא' });
        }
        const pwd = admin.password;
        const isMatch = typeof pwd === 'string' && (await bcrypt.compare(currentPassword, pwd));
        if (!isMatch) {
            return res.status(401).json({ message: 'הסיסמה הנוכחית שגויה' });
        }
        const hash = await bcrypt.hash(newPassword, 10);
        await tenantContext.run({ buildingId: 'default' }, async () => {
            await Admin.updateOne({ _id: auth!.sub }, { $set: { password: hash } });
        });
        res.json({ message: 'הסיסמה שונתה בהצלחה' });
    } catch (err) {
        console.error('Admin change-password error:', err);
        res.status(500).json({ message: 'שגיאה בשרת' });
    }
});

export default router; 