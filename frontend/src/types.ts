export interface Evaluation {
  juryId: string;
  marks: number;
  comment: string;
  round: number;
  isLocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Project {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  presentationType?: string;
  institution?: string;
  semester?: string;
  department?: string;
  teamMembers?: string[];
  mentor?: string;
  location?: string;
  evaluations: Evaluation[];
}
