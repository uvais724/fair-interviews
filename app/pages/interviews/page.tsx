import InterviewList from "@/components/interviews/InterviewList"
import prisma from "@/lib/prisma"

async function getInterviews() {
  return prisma.interview.findMany({
    orderBy: {
      interviewDate: "desc",
    },
    include: {
      kit: true,
      questions: true,
    },
  })
}

export default async function InterviewsPage() {
  const interviews = await getInterviews()

  return <InterviewList interviews={interviews} />
}
