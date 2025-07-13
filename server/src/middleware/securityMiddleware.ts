import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

// Rate limiting - הגבלת בקשות
export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 דקות
    max: 100, // מקסימום 100 בקשות לכל IP
    message: {
        error: 'יותר מדי בקשות, נסה שוב מאוחר יותר',
        hebrew: 'יותר מדי בקשות, נסה שוב מאוחר יותר'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting מיוחד להתחברות
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 דקות
    max: 5, // מקסימום 5 ניסיונות התחברות
    message: {
        error: 'יותר מדי ניסיונות התחברות, נסה שוב מאוחר יותר',
        hebrew: 'יותר מדי ניסיונות התחברות, נסה שוב מאוחר יותר'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// CORS configuration
export const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
    // Content Security Policy
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;"
    );

    // X-Frame-Options - מניעת clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // X-Content-Type-Options - מניעת MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // X-XSS-Protection - הגנה מפני XSS
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy
    res.setHeader(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=()'
    );

    next();
};

// Input validation middleware
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
    const sanitizeString = (str: string): string => {
        return str.replace(/[<>]/g, '').trim();
    };

    // ניקוי body
    if (req.body) {
        Object.keys(req.body as any).forEach(key => {
            if (typeof (req.body as any)[key] === 'string') {
                (req.body as any)[key] = sanitizeString((req.body as any)[key]);
            }
        });
    }

    // ניקוי query parameters
    if (req.query) {
        Object.keys(req.query as any).forEach(key => {
            if (typeof (req.query as any)[key] === 'string') {
                (req.query as any)[key] = sanitizeString((req.query as any)[key]);
            }
        });
    }

    next();
};

// Authentication check middleware
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            error: 'אין הרשאה',
            hebrew: 'אין הרשאה - יש להתחבר תחילה'
        });
    }

    // כאן תהיה בדיקת JWT token
    // TODO: להוסיף JWT verification

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
    const ip = req.ip || req.connection.remoteAddress;

    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

    next();
};

// Error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
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