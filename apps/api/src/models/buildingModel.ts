import mongoose, { Document, Schema } from 'mongoose';

export interface IBuilding extends Document {
  buildingId: string;
  address: string;
  buildingNumber: string;
  committeeName?: string;
  committeeContact?: string;
}

const buildingSchema = new Schema<IBuilding>({
  buildingId: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  buildingNumber: { type: String, required: true },
  committeeName: { type: String },
  committeeContact: { type: String }
});

// Building לא משתמש ב-multiTenancy – זה המודל שמגדיר את הבניינים
const Building = mongoose.model<IBuilding>('Building', buildingSchema);
export default Building;
