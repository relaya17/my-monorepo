/**
 * Smart Voting – decisions linked to maintenance and budget. Multi-tenant.
 * Supports weighted votes, proxy voting, quorum, and auto-execution to work orders.
 */
import mongoose, { Document, Schema } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

export interface IVotingOption {
  text: string;
  costEstimate?: number;
}

export interface IVoteEntry {
  userId: mongoose.Types.ObjectId;
  optionIndex: number;
  votedAt: Date;
  /** Weight (e.g. by apartment size / bylaws). Default 1. */
  voteWeight?: number;
  /** Proxy: this vote is on behalf of proxyForUserId. */
  proxyForUserId?: mongoose.Types.ObjectId;
}

export interface IVoting extends Document {
  title: string;
  description?: string;
  relatedMaintenanceId?: mongoose.Types.ObjectId;
  options: IVotingOption[];
  votes: IVoteEntry[];
  status: 'Open' | 'Passed' | 'Rejected' | 'Expired';
  deadline: Date;
  /** Percent of eligible voters required for decision (default 51). */
  requiredQuorum: number;
  /** Total eligible units/voters (set when creating; used for quorum). */
  eligibleVoterCount?: number;
  /** After Passed: Pending | WorkOrderCreated | Completed */
  executionStatus?: 'Pending' | 'WorkOrderCreated' | 'Completed';
  closedAt?: Date;
  /** Hash of protocol content for legal integrity. */
  protocolSignature?: string;
  /** Human-readable protocol summary (e.g. for submission to authority). */
  protocolSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const voteEntrySchema = new Schema<IVoteEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    optionIndex: { type: Number, required: true },
    votedAt: { type: Date, default: Date.now },
    voteWeight: { type: Number, default: 1 },
    proxyForUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const votingSchema = new Schema<IVoting>(
  {
    title: { type: String, required: true },
    description: String,
    relatedMaintenanceId: { type: Schema.Types.ObjectId, ref: 'Maintenance' },
    options: [
      {
        text: { type: String, required: true },
        costEstimate: Number,
      },
    ],
    votes: [voteEntrySchema],
    status: { type: String, enum: ['Open', 'Passed', 'Rejected', 'Expired'], default: 'Open' },
    deadline: { type: Date, required: true },
    requiredQuorum: { type: Number, default: 51 },
    eligibleVoterCount: Number,
    executionStatus: { type: String, enum: ['Pending', 'WorkOrderCreated', 'Completed'], default: 'Pending' },
    closedAt: Date,
    protocolSignature: String,
    protocolSummary: String,
  },
  { timestamps: true }
);

votingSchema.index({ buildingId: 1, status: 1, deadline: 1 });
votingSchema.index({ buildingId: 1, relatedMaintenanceId: 1 });
votingSchema.plugin(multiTenancyPlugin);

export const Voting = mongoose.model<IVoting>('Voting', votingSchema);
export default Voting;
