export interface IUser {
  email: string;
  password: string;
  role: 'admin' | 'jury' | 'team';
  name: string;
}

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
  evaluations: IEvaluation[];
}

export interface IEvaluation {
  juryId: string;
  marks: number;
  round: 1 | 2;
  isLocked: boolean;
}
