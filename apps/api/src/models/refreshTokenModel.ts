/**
 * Refresh tokens for JWT rotation. TECHNICAL_SPECIFICATION §9.2
 */
import mongoose, { Document, Schema } from 'mongoose';

export interface IRefreshToken extends Document {
  subject: string;
  type: 'user' | 'admin';
  buildingId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  subject: { type: String, required: true, index: true },
  type: { type: String, required: true, enum: ['user', 'admin'] },
  buildingId: { type: String, required: true, index: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index – MongoDB can remove expired docs

export default mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
