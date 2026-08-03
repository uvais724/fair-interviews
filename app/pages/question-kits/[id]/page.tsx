import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import { questionInputSchema } from "@/lib/question-kit-validation";
import KitDetails from "@/components/kits/KitDetails";
import type { QuestionActionState } from "@/components/kits/KitQuestionEditor";

async function getQuestionKit(id: string) {
  return prisma.questionKit.findUnique({
    where: {
      id,
    },
    include: {
      questions: {
        orderBy: {
          orderIndex: "asc",
        },
      },
    },
  });
}

export default async function QuestionKitDetailsPage({
  params,
}: PageProps<"/pages/question-kits/[id]">) {
  const { id } = await params;
  const questionKit = await getQuestionKit(id);

  if (!questionKit) {
    notFound();
  }

  async function updateQuestion(
    _state: QuestionActionState,
    formData: FormData
  ): Promise<QuestionActionState> {
    "use server";

    const questionId = formData.get("question_id")?.toString() ?? "";
    const validatedFields = questionInputSchema.safeParse({
      text: formData.get("text")?.toString() ?? "",
      tag: formData.get("tag")?.toString() ?? "",
      default_time_seconds:
        formData.get("default_time_seconds")?.toString() ?? "",
    });

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const updatedQuestion = await prisma.question.updateMany({
      where: {
        id: questionId,
        kitId: id,
      },
      data: {
        text: validatedFields.data.text,
        tag: validatedFields.data.tag,
        defaultTimeSeconds: validatedFields.data.default_time_seconds,
      },
    });

    if (updatedQuestion.count === 0) {
      return {
        success: false,
        errors: {
          form: ["Question was not found in this kit."],
        },
      };
    }

    revalidatePath(`/pages/question-kits/${id}`);

    return {
      success: true,
      message: "Question updated.",
    };
  }

  async function deleteQuestion(
    _state: QuestionActionState,
    formData: FormData
  ): Promise<QuestionActionState> {
    "use server";

    const questionId = formData.get("question_id")?.toString() ?? "";
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        kitId: id,
      },
      select: {
        id: true,
        orderIndex: true,
      },
    });

    if (!question) {
      return {
        success: false,
        errors: {
          form: ["Question was not found in this kit."],
        },
      };
    }

    const questionCount = await prisma.question.count({
      where: {
        kitId: id,
      },
    });

    if (questionCount <= 1) {
      return {
        success: false,
        errors: {
          form: ["A question kit needs at least one question."],
        },
      };
    }

    await prisma.$transaction([
      prisma.question.delete({
        where: {
          id: question.id,
        },
      }),
      prisma.question.updateMany({
        where: {
          kitId: id,
          orderIndex: {
            gt: question.orderIndex,
          },
        },
        data: {
          orderIndex: {
            decrement: 1,
          },
        },
      }),
    ]);

    revalidatePath(`/pages/question-kits/${id}`);

    return {
      success: true,
      message: "Question deleted.",
    };
  }

  return (
    <KitDetails
      questionKit={questionKit}
      updateQuestionAction={updateQuestion}
      deleteQuestionAction={deleteQuestion}
    />
  );
}
