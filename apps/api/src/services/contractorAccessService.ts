/**
 * ContractorAccessService — generates and validates Magic Links for technicians.
 *
 * Security model:
 * - A UUID v4 is generated on the server and returned to caller ONCE.
 * - Only its SHA-256 hash is stored in the DB (like a password hash).
 * - Validation hashes the incoming token and looks up the hash → no plain token in DB.
 * - Links expire after 2 hours and auto-delete after 24 h (TTL index).
 */
import crypto from 'crypto';
import { MagicLink } from '../models/magicLinkModel.js';
import type { IMagicLink } from '../models/magicLinkModel.js';

export interface GenerateLinkOptions {
  buildingId: string;
  floor: number;
  floorLabel?: string;
  contractorId?: string;
  buildingLat?: number;
  buildingLng?: number;
  isGpsRequired?: boolean;
  permissions?: string[];
  visionLogId?: string;
  /** TTL in milliseconds — defaults to 2 hours */
  ttlMs?: number;
}

export interface ValidatedAccess {
  floor: number;
  floorLabel?: string;
  buildingId: string;
  buildingLat?: number;
  buildingLng?: number;
  isGpsRequired: boolean;
  permissions: string[];
  expiresIn: string;
  contractorId?: string;
}

/** Hash a plain token using SHA-256 */
function hashToken(plainToken: string): string {
  return crypto.createHash('sha256').update(plainToken).digest('hex');
}

/** Format remaining milliseconds as "X min" or "Xh Ym" */
function formatRemaining(ms: number): string {
  if (ms <= 0) return '0 min';
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export class ContractorAccessService {
  /**
   * Generate a Magic Link for a technician.
   * Returns the PLAIN token (UUID) which must be sent via SMS/WhatsApp.
   * The plain token is NOT stored in DB.
   */
  static async generateLink(opts: GenerateLinkOptions): Promise<{ token: string; url: string }> {
    const plainToken = crypto.randomUUID();
    const tokenHash = hashToken(plainToken);
    const ttlMs = opts.ttlMs ?? 2 * 60 * 60 * 1000;

    await MagicLink.create({
      tokenHash,
      buildingId: opts.buildingId,
      floor: opts.floor,
      floorLabel: opts.floorLabel,
      contractorId: opts.contractorId,
      buildingLat: opts.buildingLat,
      buildingLng: opts.buildingLng,
      isGpsRequired: opts.isGpsRequired ?? true,
      permissions: opts.permissions ?? ['view_blueprint', 'unlock_main_gate', 'report_completion'],
      visionLogId: opts.visionLogId,
      expiresAt: new Date(Date.now() + ttlMs),
      isActive: true,
    });

    const baseUrl = process.env.APP_BASE_URL ?? 'https://app.vantera.io';
    return { token: plainToken, url: `${baseUrl}/tech/work-order/${plainToken}` };
  }

  /**
   * Validate a plain token from the technician's request.
   * Increments usageCount and returns the access payload.
   * Returns null if expired, revoked, or not found.
   */
  static async validateToken(plainToken: string): Promise<ValidatedAccess | null> {
    const tokenHash = hashToken(plainToken);
    const link = await MagicLink.findOne({
      tokenHash,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!link) return null;

    link.usageCount += 1;
    await link.save();

    return {
      floor: link.floor,
      floorLabel: link.floorLabel,
      buildingId: link.buildingId,
      buildingLat: link.buildingLat,
      buildingLng: link.buildingLng,
      isGpsRequired: link.isGpsRequired,
      permissions: link.permissions,
      expiresIn: formatRemaining(link.expiresAt.getTime() - Date.now()),
      contractorId: link.contractorId,
    };
  }

  /** Revoke a link by its plain token */
  static async revokeToken(plainToken: string): Promise<boolean> {
    const tokenHash = hashToken(plainToken);
    const result = await MagicLink.updateOne({ tokenHash }, { $set: { isActive: false } });
    return result.modifiedCount > 0;
  }

  /** Get raw IMagicLink document for logging purposes */
  static async getLinkDoc(plainToken: string): Promise<IMagicLink | null> {
    const tokenHash = hashToken(plainToken);
    return MagicLink.findOne({ tokenHash });
  }
}
