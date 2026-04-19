/**
 * Building inventory (spare parts, reorder point). Multi-tenant.
 */
import mongoose, { Document, Schema } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

export interface IInventory extends Document {
  itemName: string;
  category: 'Electrical' | 'Security' | 'Cleaning' | 'General';
  quantity: number;
  minThreshold: number;
  unitPrice?: number;
  lastSupplier?: { name?: string; phone?: string; link?: string };
  locationInBuilding?: string;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    itemName: { type: String, required: true },
    category: { type: String, enum: ['Electrical', 'Security', 'Cleaning', 'General'], required: true },
    quantity: { type: Number, default: 0 },
    minThreshold: { type: Number, default: 5 },
    unitPrice: Number,
    lastSupplier: { name: String, phone: String, link: String },
    locationInBuilding: String,
  },
  { timestamps: true }
);

inventorySchema.plugin(multiTenancyPlugin);
inventorySchema.index({ buildingId: 1, category: 1 });

export const Inventory = mongoose.model<IInventory>('Inventory', inventorySchema);
export default Inventory;
