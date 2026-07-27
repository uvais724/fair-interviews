"use client";

import type { Prisma } from "@/app/generated/prisma/client";
import Link from "next/link";

type QuestionKitWithQuestions = Prisma.QuestionKitGetPayload<{
  include: {
    questions: true;
  };
}>;

interface KitListProps {
  questionKits: QuestionKitWithQuestions[];
}

export default function KitList({ questionKits }: KitListProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1>Question Kits</h1>
      <div className="flex flex-col gap-4">
        <button className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
          Create New Question Kit
        </button>
        <div className="flex flex-col gap-2">
          <h2>Existing Question Kits</h2>
          <ul className="flex flex-col gap-2">
            {questionKits.map((kit) => (
              <li
                key={kit.id}
                className="flex items-center justify-between gap-2 rounded border p-2"
              >
                <div className="flex flex-col">
                  <span className="font-bold">{kit.title}</span>
                  <span>{kit.description ?? "No description"}</span>
                </div>
                <div>
                  <Link
                    href={`/pages/question-kits/${kit.id}`}
                    className="inline-flex rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    View Questions
                  </Link>
                  <button className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
                    Edit
                  </button>
                  <button className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
