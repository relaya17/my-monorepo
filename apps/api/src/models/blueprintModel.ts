/**
 * Building Blueprint model — floor plans, PDF/image uploads (by URL reference).
 * Supports multiple blueprints per building, indexed by floor.
 */
import mongoose, { Document, Schema } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

export interface IBlueprint extends Document {
  name: string;         // e.g. "קומה 3 – מסמך מאושר"
  fileUrl: string;      // Cloudinary / S3 URL
  mimeType: 'application/pdf' | 'image/png' | 'image/jpeg' | 'image/svg+xml';
  floor: number;        // -2 ... 50
  uploadedBy: string;   // admin userId
  uploadedByName: string;
  notes?: string;
  buildingId: string;
  createdAt: Date;
  updatedAt: Date;
}

const blueprintSchema = new Schema<IBlueprint>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    fileUrl: { type: String, required: true, trim: true },
    mimeType: {
      type: String,
      enum: ['application/pdf', 'image/png', 'image/jpeg', 'image/svg+xml'],
      default: 'application/pdf',
    },
    floor: { type: Number, required: true, min: -10, max: 100 },
    uploadedBy: { type: String, required: true },
    uploadedByName: { type: String, required: true },
    notes: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

blueprintSchema.index({ buildingId: 1, floor: 1 });
blueprintSchema.plugin(multiTenancyPlugin);

export const Blueprint = mongoose.model<IBlueprint>('Blueprint', blueprintSchema);
export default Blueprint;
