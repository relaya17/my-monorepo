/**
 * JWT refresh endpoint. TECHNICAL_SPECIFICATION §9.2
 */
import express, { Request, Response } from 'express';
import RefreshToken from '../models/refreshTokenModel.js';
import { createAccessToken, createRefreshTokenValue, getRefreshExpiresDate, hashRefreshToken } from '../utils/jwt.js';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    const refreshTokenRaw = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken.trim() : '';
    if (!refreshTokenRaw) {
        return res.status(400).json({ message: 'חסר refresh token' });
    }
    try {
        const tokenHash = hashRefreshToken(refreshTokenRaw);
        const doc = await RefreshToken.findOne({ tokenHash });
        if (!doc || doc.expiresAt < new Date()) {
            return res.status(401).json({ message: 'Refresh token לא תקין או שפג תוקפו' });
        }
        const payload = { sub: doc.subject, type: doc.type as 'user' | 'admin', buildingId: doc.buildingId };
        const accessToken = createAccessToken(payload);
        const { token: newRefresh, hash: newHash } = createRefreshTokenValue();
        const expiresAt = getRefreshExpiresDate();
        await RefreshToken.deleteOne({ tokenHash });
        await RefreshToken.create({ subject: doc.subject, type: doc.type, buildingId: doc.buildingId, tokenHash: newHash, expiresAt });
        return res.json({ accessToken, refreshToken: newRefresh });
    } catch {
        return res.status(401).json({ message: 'Refresh token לא תקין' });
    }
});

export default router;
