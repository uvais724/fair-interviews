import * as z from "zod"

export const interviewQuestionCaptureSchema = z.object({
  question_id: z.string().min(1),
  question_text: z.string().trim().min(1),
  order_index: z.number().int().min(1),
  allocated_time_seconds: z.number().int().min(0).max(7200),
  actual_time_seconds: z.coerce
    .number<number>()
    .int("Actual time must be a whole number of seconds.")
    .min(0, "Actual time cannot be negative.")
    .max(7200, "Actual time must be at most 7200 seconds."),
  rating: z.coerce
    .number<number>()
    .int("Rating must be a whole number.")
    .min(1, "Rating must be at least 1.")
    .max(5, "Rating must be at most 5."),
  notes: z.string().trim().max(500, "Notes must be at most 500 characters."),
})

export const interviewCaptureSchema = z.object({
  candidate_name: z
    .string()
    .trim()
    .min(2, "Candidate name must be at least 2 characters.")
    .max(80, "Candidate name must be at most 80 characters."),
  candidate_role: z
    .string()
    .trim()
    .min(2, "Candidate role must be at least 2 characters.")
    .max(80, "Candidate role must be at most 80 characters."),
  interview_date: z
    .string()
    .min(1, "Choose the interview date and time.")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Choose a valid interview date and time.",
    }),
  kit_id: z.string().min(1, "Choose a question kit."),
  questions: z
    .array(interviewQuestionCaptureSchema)
    .min(1, "The selected kit needs at least one question."),
  overall_rating: z.coerce
    .number<number>()
    .int("Overall rating must be a whole number.")
    .min(1, "Overall rating must be at least 1.")
    .max(5, "Overall rating must be at most 5."),
  overall_verdict: z.enum(["select", "hold", "reject"], {
    error: "Choose an overall verdict.",
  }),
  overall_comments: z
    .string()
    .trim()
    .min(10, "Overall feedback must be at least 10 characters.")
    .max(1000, "Overall feedback must be at most 1000 characters."),
})

export const interviewDetailsInputSchema = interviewCaptureSchema.pick({
  candidate_name: true,
  candidate_role: true,
  interview_date: true,
  overall_rating: true,
  overall_verdict: true,
  overall_comments: true,
})

export const interviewQuestionInputSchema =
  interviewQuestionCaptureSchema.pick({
    actual_time_seconds: true,
    rating: true,
    notes: true,
  })

export type InterviewCaptureInput = z.infer<typeof interviewCaptureSchema>
export type InterviewDetailsInput = z.infer<typeof interviewDetailsInputSchema>
export type InterviewQuestionInput = z.infer<typeof interviewQuestionInputSchema>
