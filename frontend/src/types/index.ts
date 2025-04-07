export interface User {
  id?: string;
  email: string;
  role: 'admin' | 'jury' | 'team';
  name: string;
}

export interface Project {
  _id: string;
  teamId: string;
  title: string;
  branch: string;
  mentorName: string;
  contactNumber: string;
  institution: string;
  semester: string;
  teamMembers: string[];
  location?: string;
  description?: string;
  presentationType?: string;
  evaluations: Array<{
    juryId: {
      name: string;
      _id: string;
    };
    marks: number;
  }>;
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
