/**
 * MaintenanceFeedback – דירוג איכות אחרי סגירת תקלה (Vantera Quality Control)
 * משמש ל-Vendor Score, Sentiment Analysis, Transparency Ledger
 */
import mongoose, { Document, Schema } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

export interface IMaintenanceFeedback extends Document {
  maintenanceId: mongoose.Types.ObjectId;
  residentId: mongoose.Types.ObjectId;
  rating?: number; // 1-5 (optional when status=pending - request only)
  feedbackText?: string;
  voiceNoteUrl?: string;
  sentimentScore?: number; // -1 to 1 (AI)
  contractorName?: string;
  contractorId?: string;
  status: 'pending' | 'submitted';
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IMaintenanceFeedback>(
  {
    maintenanceId: { type: Schema.Types.ObjectId, ref: 'Maintenance', required: true },
    residentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5 },
    feedbackText: { type: String },
    voiceNoteUrl: { type: String },
    sentimentScore: { type: Number, min: -1, max: 1 },
    contractorName: { type: String },
    contractorId: { type: String },
    status: { type: String, enum: ['pending', 'submitted'], default: 'submitted' },
  },
  { timestamps: true }
);

schema.index({ buildingId: 1, maintenanceId: 1 });
schema.index({ buildingId: 1, residentId: 1, status: 1 });
schema.index({ buildingId: 1, contractorName: 1 });
schema.plugin(multiTenancyPlugin);

const MaintenanceFeedback = mongoose.model<IMaintenanceFeedback>('MaintenanceFeedback', schema);
export default MaintenanceFeedback;
