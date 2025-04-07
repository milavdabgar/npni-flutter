import mongoose from 'mongoose';
import { IProject } from '../types';

const projectSchema = new mongoose.Schema<IProject>({
  teamId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  presentationType: { type: String, required: true },
  institution: { type: String, required: true },
  semester: { type: String, required: true },
  branch: { type: String, required: true },
  teamMembers: [{ type: String }],
  mentorName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  evaluations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evaluation'
  }]
}, { timestamps: true });

export default mongoose.model<IProject>('Project', projectSchema);
