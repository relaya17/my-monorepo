/**
 * JWT access and refresh token helpers. TECHNICAL_SPECIFICATION §9.2
 */
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const secret = process.env.JWT_SECRET ?? 'default-secret-change-in-production';
const accessExpires = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
const refreshExpires = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

export type AccessPayload = { sub: string; type: 'user' | 'admin'; buildingId: string; email?: string; username?: string; role?: string };

export function createAccessToken(payload: AccessPayload): string {
  return jwt.sign(
    { sub: payload.sub, type: payload.type, buildingId: payload.buildingId, email: payload.email, username: payload.username, role: payload.role },
    secret as jwt.Secret,
    { expiresIn: accessExpires } as jwt.SignOptions
  );
}

export function createRefreshTokenValue(): { token: string; hash: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, secret) as jwt.JwtPayload & AccessPayload;
  return { sub: decoded.sub, type: decoded.type, buildingId: decoded.buildingId, email: decoded.email, username: decoded.username, role: decoded.role };
}

export function getRefreshExpiresDate(): Date {
  const match = refreshExpires.match(/^(\d+)([dm])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const n = parseInt(match[1], 10);
  const unit = match[2];
  const ms = unit === 'd' ? n * 24 * 60 * 60 * 1000 : n * 60 * 1000;
  return new Date(Date.now() + ms);
}
