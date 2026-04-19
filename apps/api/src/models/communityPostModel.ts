import mongoose, { Document, Schema } from 'mongoose';
import { multiTenancyPlugin } from '../utils/multiTenancy.js';

export interface IComment {
  _id: mongoose.Types.ObjectId;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface ICommunityPost extends Document {
  authorId: string;
  authorName: string;
  content: string;
  imageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  likes: string[]; // array of userIds
  comments: IComment[];
  buildingId: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: true }
);

const communityPostSchema = new Schema<ICommunityPost>(
  {
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true, maxlength: 2000 },
    imageUrl: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    likes: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true }
);

communityPostSchema.index({ buildingId: 1, status: 1, createdAt: -1 });
communityPostSchema.plugin(multiTenancyPlugin);

export const CommunityPost = mongoose.model<ICommunityPost>('CommunityPost', communityPostSchema);
export default CommunityPost;
