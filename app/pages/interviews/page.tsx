import { redirect } from "next/navigation";

import { auth } from "@/auth";
import InterviewList from "@/components/interviews/InterviewList";
import prisma from "@/lib/prisma";

async function getInterviews() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  return prisma.interview.findMany({
    where: {
      userId,
    },
    orderBy: {
      interviewDate: "desc",
    },
    include: {
      kit: true,
      questions: true,
    },
  });
}

export default async function InterviewsPage() {
  const interviews = await getInterviews();

  return <InterviewList interviews={interviews} />;
}
