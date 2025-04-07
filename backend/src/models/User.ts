import mongoose from 'mongoose';
import { IUser } from '../types';

const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'jury', 'team'], required: true },
  name: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);
