/**
 * Escrow Payment – החזקת תשלום עד לאישור עבודה.
 * Flow: tenant pays → held → admin approves (or disputes) → released to contractor.
 * States: pending → held → approved → released | disputed → resolved
 */
import mongoose, { Document, Schema, Types } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

export interface IEscrow extends Document {
  payerId: string;
  payerName: string;
  contractorId: Types.ObjectId;
  contractorName: string;
  maintenanceId?: Types.ObjectId;
  amountIls: number;
  description: string;
  status: 'pending' | 'held' | 'approved' | 'released' | 'disputed' | 'resolved' | 'refunded';
  stripePaymentIntentId?: string;
  stripeContractorAccountId?: string;
  stripeBuildingAccountId?: string;
  contractorTransferId?: string;
  buildingTransferId?: string;
  disputeReason?: string;
  approvedBy?: string;
  approvedAt?: Date;
  releasedAt?: Date;
  buildingId: string;
  createdAt: Date;
  updatedAt: Date;
}

const escrowSchema = new Schema<IEscrow>(
  {
    payerId: { type: String, required: true },
    payerName: { type: String, required: true },
    contractorId: { type: Schema.Types.ObjectId, required: true },
    contractorName: { type: String, required: true },
    maintenanceId: { type: Schema.Types.ObjectId },
    amountIls: { type: Number, required: true, min: 1 },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'held', 'approved', 'released', 'disputed', 'resolved', 'refunded'],
      default: 'pending',
    },
    stripePaymentIntentId: { type: String },
    stripeContractorAccountId: { type: String },
    stripeBuildingAccountId: { type: String },
    contractorTransferId: { type: String },
    buildingTransferId: { type: String },
    disputeReason: { type: String },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    releasedAt: { type: Date },
  },
  { timestamps: true }
);

escrowSchema.index({ buildingId: 1, status: 1, createdAt: -1 });
escrowSchema.index({ buildingId: 1, contractorId: 1 });
escrowSchema.index({ stripePaymentIntentId: 1 });
escrowSchema.plugin(multiTenancyPlugin);

export const Escrow = mongoose.model<IEscrow>('Escrow', escrowSchema);
export default Escrow;
