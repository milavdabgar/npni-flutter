import mongoose from 'mongoose';
import { IProject } from '../types';

const projectSchema = new mongoose.Schema<IProject>({
  teamId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  presentationType: { type: String },
  institution: { type: String },
  semester: { type: String },
  branch: { type: String },
  teamMembers: [{ type: String }],
  mentorName: { type: String },
  contactNumber: { type: String },
  evaluations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evaluation',
    default: []
  }]
}, { timestamps: true });

export default mongoose.model<IProject>('Project', projectSchema);
