import { redirect } from "next/navigation"

import { InterviewCapture } from "@/components/interviews/InterviewCapture"
import { InterviewStatus, InterviewVerdict } from "@/app/generated/prisma/client"
import { interviewCaptureSchema } from "@/lib/interview-validation"
import prisma from "@/lib/prisma"

function toVerdict(value: "select" | "hold" | "reject") {
  const verdicts = {
    select: InterviewVerdict.SELECT,
    hold: InterviewVerdict.HOLD,
    reject: InterviewVerdict.REJECT,
  }

  return verdicts[value]
}

export async function createInterview(data: FormData) {
  "use server"

  const rawQuestions = data.get("questions")?.toString() ?? "[]"
  let questions: unknown

  try {
    questions = JSON.parse(rawQuestions)
  } catch {
    throw new Error("Interview questions must be valid JSON.")
  }

  const validatedFields = interviewCaptureSchema.safeParse({
    candidate_name: data.get("candidate_name")?.toString() ?? "",
    candidate_role: data.get("candidate_role")?.toString() ?? "",
    interview_date: data.get("interview_date")?.toString() ?? "",
    kit_id: data.get("kit_id")?.toString() ?? "",
    overall_rating: data.get("overall_rating")?.toString() ?? "",
    overall_verdict: data.get("overall_verdict")?.toString() ?? "",
    overall_comments: data.get("overall_comments")?.toString() ?? "",
    questions,
  })

  if (!validatedFields.success) {
    throw new Error("Interview data is invalid.")
  }

  const user = await prisma.user.findFirst()

  if (!user) {
    throw new Error("No user found in the database. Create a user first.")
  }

  const kit = await prisma.questionKit.findUnique({
    where: {
      id: validatedFields.data.kit_id,
    },
    include: {
      questions: {
        orderBy: {
          orderIndex: "asc",
        },
      },
    },
  })

  if (!kit) {
    throw new Error("Question kit was not found.")
  }

  const answersByQuestionId = new Map(
    validatedFields.data.questions.map((question) => [
      question.question_id,
      question,
    ])
  )

  if (
    kit.questions.length === 0 ||
    kit.questions.some((question) => !answersByQuestionId.has(question.id))
  ) {
    throw new Error("Interview answers do not match the selected question kit.")
  }

  await prisma.interview.create({
    data: {
      userId: user.id,
      candidateName: validatedFields.data.candidate_name,
      candidateRole: validatedFields.data.candidate_role,
      kitId: kit.id,
      status: InterviewStatus.COMPLETED,
      overallRating: validatedFields.data.overall_rating,
      overallVerdict: toVerdict(validatedFields.data.overall_verdict),
      overallComments: validatedFields.data.overall_comments,
      interviewDate: new Date(validatedFields.data.interview_date),
      questions: {
        create: kit.questions.map((kitQuestion) => ({
          questionText: kitQuestion.text,
          orderIndex: kitQuestion.orderIndex,
          allocatedTimeSeconds: kitQuestion.defaultTimeSeconds,
          actualTimeSeconds:
            answersByQuestionId.get(kitQuestion.id)?.actual_time_seconds,
          rating: answersByQuestionId.get(kitQuestion.id)?.rating,
          notes: answersByQuestionId.get(kitQuestion.id)?.notes || null,
        })),
      },
    },
  })

  redirect("/pages/interviews")
}

export default function CreateInterviewPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <InterviewCapture action={createInterview} />
    </div>
  )
}
