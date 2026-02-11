/**
 * Maintenance tickets per building. Multi-tenant; supports SLA and contractor tracking.
 */
import mongoose, { Document, Schema } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';
import { softDeletePlugin } from '../utils/softDeletePlugin.js';

/** Source of ticket – RESIDENT or AI (Vision/Satellite/IoT). See HSLL_DATABASE_SCHEMA. */
export type MaintenanceSource = 'RESIDENT' | 'AI_VISION' | 'SATELLITE' | 'IOT_SENSOR';

export interface IMaintenance extends Document {
  title: string;
  description: string;
  category: 'Elevator' | 'Plumbing' | 'Electrical' | 'Cleaning' | 'Security' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In_Progress' | 'Waiting_For_Parts' | 'Resolved' | 'Closed';
  reporterId?: mongoose.Types.ObjectId | null;
  assignedContractor?: { name?: string; phone?: string; estimatedCost?: number };
  attachments: string[];
  resolvedAt?: Date;
  technicianNotes?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  locationVerified?: boolean;
  verificationCode?: string;
  locationProof?: string;
  actualCost?: number;
  partsReplaced?: string[];
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // --- HSLL schema extensions (optional for backward compat) ---
  source?: MaintenanceSource;
  aiAnalysis?: {
    similarityHash?: string;
    urgencyScore?: number;
    detectedAnomaly?: string;
  };
  evidence?: {
    voiceNote?: string;
    aiFrameCapture?: string;
  };
  technicianReport?: {
    summary?: string;
    partsUsed?: { name: string; cost?: number }[];
    followUpRequired?: boolean;
  };
  eventId?: mongoose.Types.ObjectId;
}

const maintenanceSchema = new Schema<IMaintenance>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Elevator', 'Plumbing', 'Electrical', 'Cleaning', 'Security', 'Other'],
      required: true,
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    status: {
      type: String,
      enum: ['Open', 'In_Progress', 'Waiting_For_Parts', 'Resolved', 'Closed'],
      default: 'Open',
    },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    assignedContractor: {
      name: String,
      phone: String,
      estimatedCost: Number,
    },
    attachments: { type: [String], default: [] },
    resolvedAt: Date,
    technicianNotes: String,
    beforeImageUrl: String,
    afterImageUrl: String,
    locationVerified: { type: Boolean, default: false },
    verificationCode: String,
    locationProof: String,
    actualCost: Number,
    partsReplaced: { type: [String], default: [] },
    source: { type: String, enum: ['RESIDENT', 'AI_VISION', 'SATELLITE', 'IOT_SENSOR'] },
    aiAnalysis: {
      similarityHash: String,
      urgencyScore: { type: Number, min: 1, max: 10 },
      detectedAnomaly: String,
    },
    evidence: {
      voiceNote: String,
      aiFrameCapture: String,
    },
    technicianReport: {
      summary: String,
      partsUsed: [{ name: String, cost: Number }],
      followUpRequired: Boolean,
    },
    eventId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

maintenanceSchema.index({ buildingId: 1, status: 1, priority: 1 });
maintenanceSchema.plugin(multiTenancyPlugin);
maintenanceSchema.plugin(softDeletePlugin);

export const Maintenance = mongoose.model<IMaintenance>('Maintenance', maintenanceSchema);
export default Maintenance;
