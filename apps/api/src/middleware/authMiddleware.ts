// middleware/authMiddleware.ts
import { NextFunction, Request, Response } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // בדיקה פשוטה לדוגמה
    if (authHeader !== 'Bearer mysecrettoken') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    next();
};
