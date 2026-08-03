import Link from 'next/link'
import React from 'react'

import {
  KitQuestionEditor,
  type QuestionActionState,
} from "@/components/kits/KitQuestionEditor"

interface KitDetailsProps {
  questionKit: {
    id: string;
    title: string;
    description?: string | null;
    createdAt: Date;
    questions: {
      id: string;
      text: string;
      tag?: string | null;
      defaultTimeSeconds: number;
      orderIndex: number;
    }[];
  };
  updateQuestionAction: (
    state: QuestionActionState,
    formData: FormData
  ) => Promise<QuestionActionState>;
  deleteQuestionAction: (
    state: QuestionActionState,
    formData: FormData
  ) => Promise<QuestionActionState>;
}

export default function KitDetails({
  questionKit,
  updateQuestionAction,
  deleteQuestionAction,
}: KitDetailsProps) {
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
              <KitQuestionEditor
                key={question.id}
                question={question}
                canDelete={questionKit.questions.length > 1}
                updateQuestionAction={updateQuestionAction}
                deleteQuestionAction={deleteQuestionAction}
              />
            ))}
          </ol>
        ) : (
          <p className="rounded border p-4 text-gray-600">
            This question kit does not have any questions yet.
          </p>
        )}
      </section>
    </main>
  )
}
