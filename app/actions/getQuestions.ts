"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getQuestions() {
  const session = await auth();
  const userId = session?.user?.id;

  const questionKits = await prisma.questionKit.findMany({
    where: userId ? { userId } : undefined,
    include: {
      questions: {
        orderBy: {
          orderIndex: "asc",
        },
      },
    },
  });

  return {
    kits: questionKits.map((kit) => ({
      id: kit.id,
      title: kit.title,
      description: kit.description,
    })),
    questions: questionKits.flatMap((kit) =>
      kit.questions.map((question) => ({
        id: question.id,
        kit_id: question.kitId,
        text: question.text,
        order_index: question.orderIndex,
        default_time_seconds: question.defaultTimeSeconds,
      }))
    ),
  };
}

export async function getQuestionKits() {
  const session = await auth();
  const userId = session?.user?.id;

  return await prisma.questionKit.findMany({
    where: userId ? { userId } : undefined,
    orderBy: {
      updatedAt: "desc",
    },
  });
}