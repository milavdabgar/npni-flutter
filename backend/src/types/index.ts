import { Document } from 'mongoose';
import { Request } from 'express';
import { FileArray } from 'express-fileupload';

export interface CustomRequest extends Request {
  files?: FileArray | null;
  user?: IUser;
}

export interface IUser {
  _id: string;
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'jury' | 'team';
  name: string;
}

export type UserDocument = Document & IUser;

export interface IProject {
  teamId: string;
  title: string;
  description?: string;
  presentationType?: string;
  institution?: string;
  semester?: string;
  branch?: string;
  teamMembers: string[];
  mentorName?: string;
  contactNumber?: string;
  location?: string;
  evaluations: string[] | IEvaluation[];
}

export interface IEvaluation {
  juryId: string;
  marks: number;
  round: 1 | 2;
  isLocked: boolean;
}
