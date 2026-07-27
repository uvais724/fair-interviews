import Link from "next/link";
import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";

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
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6">
      <Link
        href="/pages/question-kits"
        className="w-fit rounded border px-3 py-2 text-sm hover:bg-gray-50"
      >
        Back to Question Kits
      </Link>

      <section className="flex flex-col gap-3 rounded border p-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{questionKit.title}</h1>
          <p className="text-gray-600">
            {questionKit.description ?? "No description"}
          </p>
        </div>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>{questionKit.questions.length} questions</span>
          <span>Created {questionKit.createdAt.toLocaleDateString()}</span>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Questions</h2>
        {questionKit.questions.length > 0 ? (
          <ol className="flex flex-col gap-3">
            {questionKit.questions.map((question) => (
              <li key={question.id} className="rounded border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      Question {question.orderIndex}
                    </span>
                    <p>{question.text}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-sm text-gray-600">
                    {question.tag && <span>{question.tag}</span>}
                    <span>{question.defaultTimeSeconds} seconds</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded border p-4 text-gray-600">
            This question kit does not have any questions yet.
          </p>
        )}
      </section>
    </main>
  );
}
