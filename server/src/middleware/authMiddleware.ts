// middleware/authMiddleware.ts
import { NextFunction } from 'express';

export const authMiddleware = (req: any, res: any, next: any) => {
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
