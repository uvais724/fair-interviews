"use server";

import prisma from "@/lib/prisma";

export async function getQuestions() {
  const questionKits = await prisma.questionKit.findMany({
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
    return await prisma.questionKit.findMany();
}