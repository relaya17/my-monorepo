/**
 * Zero-App Access: magic link for technician to open work order. Token stored in Redis 24h.
 */
import crypto from 'crypto';
import { cacheSet, cacheGet, cacheDel } from '../config/redis.js';

const TECH_TOKEN_PREFIX = 'tech_token:';
const TTL_24H = 86400;

export async function generateTechnicianLink(maintenanceId: string, buildingId: string, _phoneNumber?: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  await cacheSet(TECH_TOKEN_PREFIX + token, { maintenanceId, buildingId }, TTL_24H);
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const magicLink = `${baseUrl}/tech/work-order/${token}`;
  // TODO: send SMS via Twilio or local provider: await sendSMS(phoneNumber, `משימה הוקצתה. לצפייה: ${magicLink}`);
  return magicLink;
}

export async function resolveTechnicianToken(token: string): Promise<{ maintenanceId: string; buildingId: string } | null> {
  const raw = await cacheGet<{ maintenanceId: string; buildingId: string }>(TECH_TOKEN_PREFIX + token);
  if (!raw || typeof raw !== 'object') return null;
  const parsed = raw as { maintenanceId?: string; buildingId?: string };
  return parsed.maintenanceId && parsed.buildingId ? { maintenanceId: parsed.maintenanceId, buildingId: parsed.buildingId } : null;
}

export async function invalidateTechnicianToken(token: string): Promise<void> {
  await cacheDel(TECH_TOKEN_PREFIX + token);
}
