import mongoose from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

export interface ISecurityQuestion {
  question: string;
  answerHash: string;
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    password: { type: String, required: true, select: false },
    apartmentNumber: { type: String, index: true },
    role: { type: String, enum: ['tenant', 'committee', 'admin'], default: 'tenant' },
    securityQuestions: [
      { question: { type: String, required: true }, answerHash: { type: String, required: true } }
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.plugin(multiTenancyPlugin);
userSchema.index({ buildingId: 1, email: 1 }, { unique: true });
userSchema.index({ buildingId: 1, apartmentNumber: 1 });

const User = mongoose.model('User', userSchema);
export default User;
