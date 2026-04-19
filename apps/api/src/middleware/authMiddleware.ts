// middleware/authMiddleware.ts – JWT verification (TECHNICAL_SPECIFICATION §9.2)
import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        return res.status(401).json({ error: 'אין הרשאה', hebrew: 'יש להתחבר תחילה' });
    }
    try {
        req.auth = verifyAccessToken(token);
        next();
    } catch {
        return res.status(403).json({ error: 'Forbidden', hebrew: 'טוקן לא תקין או שפג תוקפו' });
    }
};

/** Only super-admin role can access (CEO dashboard). */
export const verifySuperAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
        return res.status(401).json({ error: 'Unauthorized', hebrew: 'יש להתחבר תחילה' });
    }
    if (req.auth.type !== 'admin' || req.auth.role !== 'super-admin') {
        return res.status(403).json({ error: 'Forbidden', hebrew: 'גישה למנכ"לית בלבד' });
    }
    next();
};
