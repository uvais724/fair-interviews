import { Interview } from "./interview.model";
import { Question } from "./question.model";
import { User } from "./user.model";

export class QuestionKit {
  id!: string;
  userId!: string;

  title!: string;
  description?: string;

  createdAt!: Date;
  updatedAt!: Date;

  user?: User;
  questions?: Question[];
  interviews?: Interview[];
}