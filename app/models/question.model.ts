import { QuestionKit } from "./question-kit.model";


export class Question {
  id!: string;
  kitId!: string;

  text!: string;
  orderIndex!: number;
  defaultTimeSeconds!: number;
  tag?: string;

  createdAt!: Date;

  kit?: QuestionKit;
}