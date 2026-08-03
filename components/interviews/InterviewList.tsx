import type { Prisma } from "@/app/generated/prisma/client"
import Link from "next/link"

import { Button } from "@/components/ui/button"

type InterviewWithDetails = Prisma.InterviewGetPayload<{
  include: {
    kit: true
    questions: true
  }
}>

type InterviewListProps = {
  interviews: InterviewWithDetails[]
}

function verdictLabel(verdict?: string | null) {
  if (!verdict) {
    return "No verdict"
  }

  return verdict.toLowerCase()
}

export default function InterviewList({ interviews }: InterviewListProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interviews</h1>
          <p className="text-sm text-muted-foreground">
            Review captured interviews and start new sessions.
          </p>
        </div>
        <Button>
          <Link href="/pages/interviews/create">Capture Interview</Link>
        </Button>
      </div>

      {interviews.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {interviews.map((interview) => (
            <li
              key={interview.id}
              className="flex flex-col gap-4 rounded border p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="wrap-break-word font-bold">
                  {interview.candidateName}
                </span>
                <span className="wrap-break-word text-sm text-muted-foreground">
                  {interview.candidateRole}
                </span>
                <span className="text-sm text-muted-foreground">
                  {interview.kit?.title ?? "Deleted question kit"}
                </span>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:items-end">
                <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:items-end">
                  <span>{interview.interviewDate.toLocaleDateString()}</span>
                  <span>
                    {interview.questions.length} questions ·{" "}
                    {verdictLabel(interview.overallVerdict)}
                  </span>
                </div>
                <Button variant="link">
                  <Link href={`/pages/interviews/${interview.id}`}>
                    View Interview
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded border p-4 text-sm text-muted-foreground">
          No interviews have been captured yet.
        </div>
      )}
    </main>
  )
}
