import { revalidatePath } from "next/cache"
import { notFound, redirect } from "next/navigation"

import { InterviewVerdict } from "@/app/generated/prisma/client"
import InterviewDetails, {
  type InterviewActionState,
  type InterviewQuestionActionState,
} from "@/components/interviews/InterviewDetails"
import {
  interviewDetailsInputSchema,
  interviewQuestionInputSchema,
} from "@/lib/interview-validation"
import prisma from "@/lib/prisma"

async function getInterview(id: string) {
  return prisma.interview.findUnique({
    where: {
      id,
    },
    include: {
      kit: true,
      questions: {
        orderBy: {
          orderIndex: "asc",
        },
      },
    },
  })
}

function toVerdict(value: "select" | "hold" | "reject") {
  const verdicts = {
    select: InterviewVerdict.SELECT,
    hold: InterviewVerdict.HOLD,
    reject: InterviewVerdict.REJECT,
  }

  return verdicts[value]
}

export default async function InterviewDetailsPage({
  params,
}: PageProps<"/pages/interviews/[id]">) {
  const { id } = await params
  const interview = await getInterview(id)

  if (!interview) {
    notFound()
  }

  async function updateInterview(
    _state: InterviewActionState,
    formData: FormData
  ): Promise<InterviewActionState> {
    "use server"

    const interviewId = formData.get("interview_id")?.toString() ?? ""

    if (interviewId !== id) {
      return {
        success: false,
        errors: {
          form: ["Interview was not found."],
        },
      }
    }

    const validatedFields = interviewDetailsInputSchema.safeParse({
      candidate_name: formData.get("candidate_name")?.toString() ?? "",
      candidate_role: formData.get("candidate_role")?.toString() ?? "",
      interview_date: formData.get("interview_date")?.toString() ?? "",
      overall_rating: formData.get("overall_rating")?.toString() ?? "",
      overall_verdict: formData.get("overall_verdict")?.toString() ?? "",
      overall_comments: formData.get("overall_comments")?.toString() ?? "",
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const updatedInterview = await prisma.interview.updateMany({
      where: {
        id,
      },
      data: {
        candidateName: validatedFields.data.candidate_name,
        candidateRole: validatedFields.data.candidate_role,
        interviewDate: new Date(validatedFields.data.interview_date),
        overallRating: validatedFields.data.overall_rating,
        overallVerdict: toVerdict(validatedFields.data.overall_verdict),
        overallComments: validatedFields.data.overall_comments,
      },
    })

    if (updatedInterview.count === 0) {
      return {
        success: false,
        errors: {
          form: ["Interview was not found."],
        },
      }
    }

    revalidatePath("/pages/interviews")
    revalidatePath(`/pages/interviews/${id}`)

    return {
      success: true,
      message: "Interview updated.",
    }
  }

  async function deleteInterview(
    _state: InterviewActionState,
    formData: FormData
  ): Promise<InterviewActionState> {
    "use server"

    const interviewId = formData.get("interview_id")?.toString() ?? ""

    if (interviewId !== id) {
      return {
        success: false,
        errors: {
          form: ["Interview was not found."],
        },
      }
    }

    const deletedInterview = await prisma.interview.deleteMany({
      where: {
        id,
      },
    })

    if (deletedInterview.count === 0) {
      return {
        success: false,
        errors: {
          form: ["Interview was not found."],
        },
      }
    }

    revalidatePath("/pages/interviews")
    redirect("/pages/interviews")
  }

  async function updateQuestion(
    _state: InterviewQuestionActionState,
    formData: FormData
  ): Promise<InterviewQuestionActionState> {
    "use server"

    const questionId = formData.get("question_id")?.toString() ?? ""
    const validatedFields = interviewQuestionInputSchema.safeParse({
      actual_time_seconds:
        formData.get("actual_time_seconds")?.toString() ?? "",
      rating: formData.get("rating")?.toString() ?? "",
      notes: formData.get("notes")?.toString() ?? "",
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const updatedQuestion = await prisma.interviewQuestion.updateMany({
      where: {
        id: questionId,
        interviewId: id,
      },
      data: {
        actualTimeSeconds: validatedFields.data.actual_time_seconds,
        rating: validatedFields.data.rating,
        notes: validatedFields.data.notes || null,
      },
    })

    if (updatedQuestion.count === 0) {
      return {
        success: false,
        errors: {
          form: ["Interview question was not found."],
        },
      }
    }

    revalidatePath(`/pages/interviews/${id}`)

    return {
      success: true,
      message: "Question feedback updated.",
    }
  }

  return (
    <InterviewDetails
      interview={interview}
      updateInterviewAction={updateInterview}
      deleteInterviewAction={deleteInterview}
      updateQuestionAction={updateQuestion}
    />
  )
}
