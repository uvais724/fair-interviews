"use client";

import type { Prisma } from "@/app/generated/prisma/client";
import Link from "next/link";

type QuestionKitWithQuestions = Prisma.QuestionKitGetPayload<Record<string, never>>;

interface KitListProps {
  questionKits: QuestionKitWithQuestions[];
}

export default function KitList({ questionKits }: KitListProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1>Question Kits</h1>
      <div className="flex flex-col gap-4">
        <Link
          href="/pages/question-kits/create"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Create New Question Kit
        </Link>
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
                    className="inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    View Questions
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
