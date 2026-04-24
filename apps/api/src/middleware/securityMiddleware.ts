import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

// Rate limiting מיוחד להתחברות
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 דקות
    max: 5, // מקסימום 5 ניסיונות התחברות
    message: {
        error: 'יותר מדי ניסיונות התחברות, נסה שוב מאוחר יותר',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Input validation middleware
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
    const sanitizeString = (str: string): string => {
        return str.replace(/[<>]/g, '').trim();
    };

    // ניקוי body
    if (req.body) {
        const body = req.body as Record<string, unknown>;
        Object.keys(body).forEach(key => {
            if (typeof body[key] === 'string') {
                body[key] = sanitizeString(body[key] as string);
            }
        });
    }

    // ניקוי query parameters
    if (req.query) {
        const query = req.query as Record<string, unknown>;
        Object.keys(query).forEach(key => {
            if (typeof query[key] === 'string') {
                query[key] = sanitizeString(query[key] as string);
            }
        });
    }

    next();
};

// Admin authorization middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    // בדיקה אם המשתמש הוא אדמין
    // TODO: להוסיף בדיקת תפקיד אדמין

    next();
};

// Logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip ?? req.socket.remoteAddress;

    logger.info(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

    next();
};

// Error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);

    res.status(500).json({
        error: 'שגיאה פנימית בשרת',
        hebrew: 'שגיאה פנימית בשרת - אנא נסה שוב מאוחר יותר',
        timestamp: new Date().toISOString()
    });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        error: 'הנתיב לא נמצא',
        hebrew: 'הנתיב המבוקש לא נמצא',
        path: req.url
    });
}; 