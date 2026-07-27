import { Interview } from "./interview.model";
import { QuestionKit } from "./question-kit.model";

export class User {
  id!: string;
  email!: string;
  name!: string;
  createdAt!: Date;

  questionKits?: QuestionKit[];
  interviews?: Interview[];
}