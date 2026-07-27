import { User } from "./user.model";
import { QuestionKit } from "./question-kit.model";
import { InterviewStatus } from "./interview-status.enum";
import { InterviewVerdict } from "./interview-verdict.enum";
import { InterviewQuestion } from "./interview-question.model";

export class Interview {
  id!: string;
  userId!: string;
  kitId?: string;

  candidateName!: string;
  candidateRole!: string;

  status!: InterviewStatus;

  overallRating?: number;
  overallVerdict?: InterviewVerdict;
  overallComments?: string;

  interviewDate!: Date;

  createdAt!: Date;
  updatedAt!: Date;

  user?: User;
  kit?: QuestionKit;

  questions?: InterviewQuestion[];
}