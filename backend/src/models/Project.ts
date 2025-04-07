import mongoose from 'mongoose';
import { IProject } from '../types';

const projectSchema = new mongoose.Schema<IProject>({
  teamId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  presentationType: String,
  institution: String,
  semester: String,
  branch: String,
  teamMembers: [String],
  mentorName: String,
  contactNumber: String,
  location: String,
  evaluations: [{
    juryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    marks: Number,
    round: { type: Number, enum: [1, 2] },
    isLocked: { type: Boolean, default: false }
  }]
}, { timestamps: true });

export default mongoose.model<IProject>('Project', projectSchema);
