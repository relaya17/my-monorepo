/**
 * Webhooks Gateway – רישום חיצוני לאירועי בריאות בניין (TECHNICAL_NEXT_TASKS).
 * ביטוח, תחזוקה, עיריות – Auth, Rate limit, Retry.
 */
import mongoose, { Document, Schema } from 'mongoose';

export type WebhookEventType = 'building_pulse' | 'anomaly_alert' | 'maintenance_status' | 'ledger_milestone' | 'real_estate_lead';

export interface IWebhookSubscription extends Document {
  url: string;
  apiKeyHash: string;
  buildingIds: string[];
  events: WebhookEventType[];
  secret?: string; // for signing payloads
  active: boolean;
  lastDeliveryAt?: Date;
  failureCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IWebhookSubscription>(
  {
    url: { type: String, required: true },
    apiKeyHash: { type: String, required: true },
    buildingIds: { type: [String], default: [] },
    events: { type: [String], enum: ['building_pulse', 'anomaly_alert', 'maintenance_status', 'ledger_milestone', 'real_estate_lead'], default: [] },
    secret: { type: String },
    active: { type: Boolean, default: true },
    lastDeliveryAt: { type: Date },
    failureCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ url: 1 }, { unique: true });
schema.index({ active: 1, events: 1 });

export default mongoose.model<IWebhookSubscription>('WebhookSubscription', schema);
