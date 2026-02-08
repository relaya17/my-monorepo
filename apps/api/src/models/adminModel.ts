import mongoose, { Document, Schema } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

export interface IAdmin extends Document {
    username: string;
    password: string;
    role: string;
}

const adminSchema = new Schema<IAdmin>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' }
});

adminSchema.plugin(multiTenancyPlugin);

const Admin = mongoose.model<IAdmin>('Admin', adminSchema);
export default Admin; 