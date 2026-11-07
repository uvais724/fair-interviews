import { revalidatePath } from "next/cache"
import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
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
import { minutesToSeconds } from "@/lib/utils"

async function getInterview(id: string, userId: string) {
  return prisma.interview.findUnique({
    where: {
      id,
      userId,
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
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params
  const interview = await getInterview(id, session.user.id)

  if (!interview) {
    notFound()
  }

  async function updateInterview(
    _state: InterviewActionState,
    formData: FormData
  ): Promise<InterviewActionState> {
    "use server"

    const currentSession = await auth();

    if (!currentSession?.user?.id) {
      return {
        success: false,
        errors: {
          form: ["You must be signed in to update interviews."],
        },
      };
    }

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
        userId: currentSession.user.id,
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

    const currentSession = await auth();

    if (!currentSession?.user?.id) {
      return {
        success: false,
        errors: {
          form: ["You must be signed in to delete interviews."],
        },
      };
    }

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
        userId: currentSession.user.id,
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

    const currentSession = await auth();

    if (!currentSession?.user?.id) {
      return {
        success: false,
        errors: {
          form: ["You must be signed in to update interview feedback."],
        },
      };
    }

    const questionId = formData.get("question_id")?.toString() ?? ""
    const validatedFields = interviewQuestionInputSchema.safeParse({
      actual_time_seconds:
        minutesToSeconds(
          Number(formData.get("actual_time_seconds")?.toString() ?? "")
        ),
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
        interview: {
          userId: currentSession.user.id,
        },
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
