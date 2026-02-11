import mongoose, { Document, Schema } from 'mongoose';

export interface IBuilding extends Document {
  buildingId: string;
  address: string;
  buildingNumber: string;
  committeeName?: string;
  committeeContact?: string;
  /** Stripe Connect Express account ID – לקבלת תשלומים ויציאה לספקים */
  stripeAccountId?: string;
  stripeOnboardingComplete?: boolean;
}

const buildingSchema = new Schema<IBuilding>({
  buildingId: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  buildingNumber: { type: String, required: true },
  committeeName: { type: String },
  committeeContact: { type: String },
  stripeAccountId: { type: String, sparse: true },
  stripeOnboardingComplete: { type: Boolean, default: false },
});

// Building לא משתמש ב-multiTenancy – זה המודל שמגדיר את הבניינים
const Building = mongoose.model<IBuilding>('Building', buildingSchema);
export default Building;
