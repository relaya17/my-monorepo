import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import RefreshToken from '../models/refreshTokenModel.js';
import { createAccessToken, createRefreshTokenValue, getRefreshExpiresDate } from '../utils/jwt.js';
import { validateEmail, validatePassword } from '../utils/validation.js';

const router: express.Router = express.Router();

router.post('/', async (req: Request, res: Response) => {
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
        if (process.env.NODE_ENV !== 'production' && process.env.DEBUG_AUTH === 'true') {
            console.log('=== LOGIN DEBUG ===');
            console.log('Original email:', email);
            console.log('Normalized email:', normalizedEmail);
        }

        const user = await User.findOne({ email: normalizedEmail }).select('+password');
        if (process.env.NODE_ENV !== 'production' && process.env.DEBUG_AUTH === 'true') {
            console.log('User found:', user ? 'Yes' : 'No');
            if (user) {
                console.log('User email in DB:', user.email);
                console.log('User name:', user.name);
            }
        }

        if (!user) {
            return res.status(401).json({
                message: 'אימייל או סיסמה שגויים',
                field: 'general'
            });
        }

        // השוואת הסיסמה
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (process.env.NODE_ENV !== 'production' && process.env.DEBUG_AUTH === 'true') {
            console.log('Password valid:', isPasswordValid);
        }

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'אימייל או סיסמה שגויים',
                field: 'general'
            });
        }

        const buildingId = (user as { buildingId?: string }).buildingId ?? (req.headers['x-building-id'] as string)?.trim() ?? 'default';
        const sub = (user._id as { toString(): string }).toString();
        const accessToken = createAccessToken({ sub, type: 'user', buildingId, email: user.email });
        const { token: refreshToken, hash: tokenHash } = createRefreshTokenValue();
        const expiresAt = getRefreshExpiresDate();
        await RefreshToken.create({ subject: sub, type: 'user', buildingId, tokenHash, expiresAt });

        return res.status(200).json({
            message: 'התחברת בהצלחה',
            user: {
                id: (user._id as { toString?: () => string })?.toString?.() ?? String(user._id),
                name: user.name,
                email: user.email,
                buildingId
            },
            accessToken,
            refreshToken
        });
    } catch (error: unknown) {
        console.error('Error during login:', error);
        return res.status(500).json({
            message: 'שגיאה בשרת, אנא נסה שוב',
            field: 'general'
        });
    }
});

export default router; 