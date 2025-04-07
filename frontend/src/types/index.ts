export interface User {
  id?: string;
  email: string;
  role: 'admin' | 'jury' | 'team';
  name: string;
}

export interface Project {
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
  evaluations: Evaluation[];
}

export interface Evaluation {
  juryId: string;
  marks: number;
  round: 1 | 2;
  isLocked: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
