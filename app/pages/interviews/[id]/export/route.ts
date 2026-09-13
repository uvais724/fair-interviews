import { createXlsxWorkbook, type Worksheet } from "@/lib/xlsx-export"
import prisma from "@/lib/prisma"

export const runtime = "nodejs"

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(value)
}

function displayValue(value: string | number | null | undefined) {
  return value ?? ""
}

function titleCase(value: string | null | undefined) {
  if (!value) {
    return "No verdict"
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function safeFilePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80)
}

export async function GET(
  _request: Request,
  { params }: { params: Record<string, string | string[]> }
) {
  const { id: idParam } = await params
  const id = Array.isArray(idParam) ? idParam[0] : idParam

  if (!id) {
    return new Response("Interview was not found.", { status: 404 })
  }

  const interview = await prisma.interview.findUnique({
    where: {
      id,
    },
    include: {
      kit: {
        include: {
          questions: {
            orderBy: {
              orderIndex: "asc",
            },
          },
        },
      },
      questions: {
        orderBy: {
          orderIndex: "asc",
        },
      },
    },
  })

  console.log("interview", interview)

  if (!interview) {
    return new Response("Interview was not found.", { status: 404 })
  }

  const verdictRow = interview.questions.length + 11
  const sheet: Worksheet = {
    name: "Interview Report",
    columns: [24.62, 43.67, 31.16, 17.24, 18.22, 23.93, 39.51],
    merges: [
      "A1:G1",
      "A3:G3",
      "A8:G8",
      `A${verdictRow}:G${verdictRow}`,
    ],
    rows: [
      [{ value: "Interview Evaluation Report", style: "title" }, "", "", "", "", "", ""],
      [],
      [{ value: "Candidate Information", style: "section" }, "", "", "", "", "", ""],
      [
        { value: "Candidate Name", style: "label" },
        { value: interview.candidateName, style: "value" },
        { value: "Position", style: "label" },
        { value: interview.candidateRole, style: "value" },
        { value: "Interview Date", style: "label" },
        { value: formatDate(interview.interviewDate), style: "value" },
      ],
      [
        { value: "Question Kit", style: "label" },
        { value: interview.kit?.title ?? "Deleted question kit", style: "value" },
        { value: "Status", style: "label" },
        { value: titleCase(interview.status), style: "value" },
        { value: "Questions", style: "label" },
        { value: interview.questions.length, style: "value" },
      ],
      [],
      [],
      [{ value: "Question Evaluation", style: "section" }, "", "", "", "", "", ""],
      [
        { value: "#", style: "tableHeader" },
        { value: "Tag", style: "tableHeader" },
        { value: "Question", style: "tableHeader" },
        { value: "Allocated Time", style: "tableHeader" },
        { value: "Actual Time", style: "tableHeader" },
        { value: "Rating", style: "tableHeader" },
        { value: "Comments", style: "tableHeader" },
      ],
      ...interview.questions.map((question) => [
        { value: question.orderIndex, style: "number" },
        { value: question.tag, style: "tableCell" },
        { value: question.questionText, style: "tableCell" },
        { value: `${question.allocatedTimeSeconds}s`, style: "number" },
        { value: `${question.actualTimeSeconds ?? 0}s`, style: "number" },
        { value: question.rating ? `${question.rating}/5` : "", style: "number" },
        { value: displayValue(question.notes), style: "tableCell" },
      ]),
      [],
      [
        { value: "Final Verdict", style: "verdictSection" },
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      [
        { value: "Overall Rating", style: "verdictLabel" },
        {
          value: interview.overallRating ? `${interview.overallRating}/5` : "",
          style: "verdictValue",
        },
      ],
      [
        { value: "Verdict", style: "verdictLabel" },
        { value: titleCase(interview.overallVerdict), style: "verdictSelect" },
      ],
      [
        { value: "Updated", style: "verdictLabel" },
        { value: formatDate(interview.updatedAt), style: "verdictValue" },
      ],
      [
        { value: "Overall Comments", style: "verdictLabel" },
        { value: displayValue(interview.overallComments), style: "verdictComments" },
      ],
    ],
  }

  const workbook = createXlsxWorkbook([sheet])
  const candidate = safeFilePart(interview.candidateName) || "candidate"
  const timestamp = new Date().toISOString().split("T")[0]

  return new Response(workbook, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="interview-report-${candidate}-${timestamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  })
}
