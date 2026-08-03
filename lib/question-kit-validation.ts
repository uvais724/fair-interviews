import * as z from "zod"

export const questionInputSchema = z.object({
  text: z
    .string()
    .trim()
    .min(10, "Question must be at least 10 characters.")
    .max(240, "Question must be at most 240 characters."),
  default_time_seconds: z.coerce
    .number<number>()
    .int("Time must be a whole number of seconds.")
    .min(60, "Time must be at least 60 seconds.")
    .max(7200, "Time must be at most 7200 seconds."),
  tag: z
    .string()
    .trim()
    .min(2, "Tag must be at least 2 characters.")
    .max(40, "Tag must be at most 40 characters."),
})

export const kitDetailsInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Kit title must be at least 3 characters.")
    .max(80, "Kit title must be at most 80 characters."),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(240, "Description must be at most 240 characters."),
})

export const kitInputSchema = kitDetailsInputSchema.extend({
  questions: z.array(questionInputSchema).min(1, "Add at least one question."),
})

export type KitInput = z.infer<typeof kitInputSchema>
export type KitDetailsInput = z.infer<typeof kitDetailsInputSchema>
export type QuestionInput = z.infer<typeof questionInputSchema>
