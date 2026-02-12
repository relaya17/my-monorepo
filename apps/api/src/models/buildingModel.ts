import mongoose, { Document, Schema } from 'mongoose';

/** Metric or Imperial – for US expansion */
export type UnitSystem = 'METRIC' | 'IMPERIAL';

export interface IBuilding extends Document {
  buildingId: string;
  address: string;
  buildingNumber: string;
  committeeName?: string;
  committeeContact?: string;
  /** Stripe Connect Express account ID – לקבלת תשלומים ויציאה לספקים */
  stripeAccountId?: string;
  stripeOnboardingComplete?: boolean;
  /** Region/country – "IL" | "US" – for i18n, AI context, feature flags */
  country?: string;
  /** Currency – "ILS" | "USD" – defaults by country */
  currency?: string;
  /** Timezone – "Asia/Jerusalem" | "America/New_York" – critical for technician coordination. Store all dates in UTC in DB; convert only in UI. */
  timezone?: string;
  /** METRIC or IMPERIAL – Fahrenheit/PSI for US */
  units?: UnitSystem;
  /** US address fields – Zip required for payments/insurance */
  state?: string;
  zipCode?: string;
  county?: string;
}

const buildingSchema = new Schema<IBuilding>({
  buildingId: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  buildingNumber: { type: String, required: true },
  committeeName: { type: String },
  committeeContact: { type: String },
  stripeAccountId: { type: String, sparse: true },
  stripeOnboardingComplete: { type: Boolean, default: false },
  country: { type: String },
  currency: { type: String },
  timezone: { type: String },
  units: { type: String, enum: ['METRIC', 'IMPERIAL'] },
  state: { type: String },
  zipCode: { type: String },
  county: { type: String },
});

// Building לא משתמש ב-multiTenancy – זה המודל שמגדיר את הבניינים
const Building = mongoose.model<IBuilding>('Building', buildingSchema);
export default Building;
