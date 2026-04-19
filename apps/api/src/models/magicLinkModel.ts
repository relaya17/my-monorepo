/**
 * MagicLink — secure time-limited access token for technicians.
 * Generated automatically when AI Vision detects a fault.
 * v3.1: token is stored as SHA-256 hash (never plain UUID in DB).
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMagicLink extends Document {
  /** SHA-256(uuid) — never store plain token */
  tokenHash: string;
  buildingId: string;
  /** Mongo _id of the Building (for $lookup joins) */
  buildingObjectId?: Types.ObjectId;
  floor: number;
  floorLabel?: string;
  contractorId?: string;
  /** GPS coordinates of the building — for frontend distance check */
  buildingLat?: number;
  buildingLng?: number;
  /** Whether GPS proximity check is mandatory */
  isGpsRequired: boolean;
  expiresAt: Date;
  isActive: boolean;
  usageCount: number;
  /** Permissions granted to the technician */
  permissions: string[];
  /** AI Vision log id that triggered this link */
  visionLogId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const magicLinkSchema = new Schema<IMagicLink>(
  {
    tokenHash: { type: String, required: true, unique: true },
    buildingId: { type: String, required: true },
    buildingObjectId: { type: Schema.Types.ObjectId, ref: 'Building' },
    floor: { type: Number, required: true },
    floorLabel: { type: String },
    contractorId: { type: String },
    buildingLat: { type: Number },
    buildingLng: { type: Number },
    isGpsRequired: { type: Boolean, default: true },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
    permissions: {
      type: [String],
      default: ['view_blueprint', 'unlock_main_gate', 'report_completion'],
    },
    visionLogId: { type: String },
  },
  { timestamps: true }
);

// TTL index: auto-delete expired links after 24 h
magicLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });
magicLinkSchema.index({ buildingId: 1, isActive: 1 });

export const MagicLink = mongoose.model<IMagicLink>('MagicLink', magicLinkSchema);
export default MagicLink;
