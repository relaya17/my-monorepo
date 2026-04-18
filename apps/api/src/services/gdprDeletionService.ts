/**
 * GDPR Right to be Forgotten – מחיקת/אנונימיזציה נתוני משתמש
 * COMPLIANCE_CHECKLIST, IMPLEMENTATION_STATUS
 *
 * Strategy: Anonymize User (preserve referential integrity for Payment, Maintenance, etc.)
 * and delete RefreshTokens. Records that reference the user will show "[Deleted]" when populated.
 */
import User from '../models/userModel.js';
import RefreshToken from '../models/refreshTokenModel.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const ANONYMOUS_NAME = '[Deleted]';
const ANONYMOUS_EMAIL_PREFIX = 'deleted_';

export interface GdprDeletionResult {
  success: boolean;
  message: string;
}

/**
 * Irreversibly anonymize user and delete their sessions.
 * Caller must verify: auth.type === 'user', auth.sub === requested userId, buildingId match.
 */
export async function anonymizeUserAndDeleteSessions(
  userId: string,
  buildingId: string
): Promise<GdprDeletionResult> {
  try {
    await tenantContext.run({ buildingId }, async () => {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      // Anonymize PII – irreversible
      const anonymousEmail = `${ANONYMOUS_EMAIL_PREFIX}${userId.slice(-8)}_${Date.now()}@gdpr.deleted`;
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hash = await bcrypt.hash(randomPassword, 10);

      await User.updateOne(
        { _id: userId },
        {
          $set: {
            name: ANONYMOUS_NAME,
            email: anonymousEmail,
            password: hash,
            apartmentNumber: '',
            notAtHome: false,
            awayUntil: null,
            securityQuestions: [],
          },
        }
      );
    });

    // RefreshToken has no tenant scope – delete globally by subject
    const { deletedCount } = await RefreshToken.deleteMany({ subject: userId, type: 'user' });

    return {
      success: true,
      message: 'Account data anonymized. All sessions revoked.',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg === 'USER_NOT_FOUND') {
      return { success: false, message: 'User not found' };
    }
    throw err;
  }
}
