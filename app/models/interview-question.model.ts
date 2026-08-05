import { Interview } from "./interview.model";

export class InterviewQuestion {
  id!: string;
  interviewId!: string;

  tag?: string;

  questionText!: string;

  orderIndex!: number;

  allocatedTimeSeconds!: number;
  actualTimeSeconds?: number;

  rating?: number;
  notes?: string;

  createdAt!: Date;

  interview?: Interview;
}