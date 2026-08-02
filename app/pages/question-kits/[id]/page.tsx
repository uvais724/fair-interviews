import Link from "next/link";
import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import KitDetails from "@/components/kits/KitDetails";

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

  return (
    <KitDetails questionKit={questionKit} />
  );
}
