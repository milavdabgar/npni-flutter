import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'admin' | 'jury' | 'team';
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject extends Document {
  teamId: string;
  title: string;
  institution: string;
  members: string[];
  evaluations: string[];
  round: number;
  createdAt: Date;
  updatedAt: Date;
}

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
