import mongoose, { Schema, Document } from 'mongoose';

export interface IEvaluation extends Document {
  projectId: string;
  juryId: string;
  marks: number;
  comment: string;
  round: number;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EvaluationSchema: Schema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  juryId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  marks: { type: Number, required: true, min: 0, max: 100 },
  comment: { type: String, required: true },
  round: { type: Number, required: true, default: 1 },
  isLocked: { type: Boolean, required: true, default: false },
}, {
  timestamps: true
});

export default mongoose.model<IEvaluation>('Evaluation', EvaluationSchema);
