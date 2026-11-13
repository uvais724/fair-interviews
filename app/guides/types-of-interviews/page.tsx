import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Types of Job Interviews: A Practical Guide for Hiring Teams",
  description:
    "Learn the most common types of job interviews, from structured and behavioral interviews to technical, panel, and case interviews.",
  alternates: { canonical: "/guides/types-of-interviews" },
};

const interviewTypes = [
  {
    title: "Structured interviews",
    text: "Every candidate is asked the same core questions in the same order and assessed against shared criteria. This makes answers easier to compare and helps interviewers stay focused on job-related evidence.",
  },
  {
    title: "Behavioral interviews",
    text: "Behavioral questions ask candidates to describe how they handled situations in the past. Prompts such as “Tell me about a time you resolved a disagreement” can reveal how someone approaches collaboration, ownership, and problem solving.",
  },
  {
    title: "Technical interviews",
    text: "Technical interviews assess role-specific knowledge and practical skills. Depending on the job, they may include a work sample, a coding or design exercise, troubleshooting, or a discussion of previous work. Share the format and expectations in advance.",
  },
  {
    title: "Situational interviews",
    text: "Situational questions present a realistic, hypothetical work challenge and ask what the candidate would do. Use scenarios that reflect actual responsibilities, then evaluate the reasoning and trade-offs behind the response.",
  },
  {
    title: "Panel interviews",
    text: "A panel interview brings several interviewers into one conversation. It can reduce repeated interview rounds, but works best when panelists have clear roles, ask coordinated questions, and record their own evidence before discussing a decision.",
  },
  {
    title: "Case interviews",
    text: "Case interviews ask candidates to analyze a business or role-related problem aloud. They are common in consulting and analytical roles. Assess the candidate’s approach, assumptions, and communication, not just whether they reach one expected answer.",
  },
  {
    title: "Screening interviews",
    text: "An initial screening interview checks basic role alignment, relevant experience, motivation, and practical requirements. Keep it consistent and focused so candidates are evaluated on comparable information.",
  },
];

export default function TypesOfInterviewsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <article className="prose-content">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Hiring guide
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Types of Job Interviews: A Practical Guide for Hiring Teams
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          The right interview format depends on what a role requires. A good process
          gives candidates a fair chance to show relevant skills and gives hiring
          teams useful evidence to compare. Many teams combine formats across
          interview stages while keeping the core evaluation criteria consistent.
        </p>

        <h2 className="mt-12 text-2xl font-semibold text-slate-900">Common interview formats</h2>
        <div className="mt-5 space-y-5">
          {interviewTypes.map((item) => (
            <section key={item.title} className="rounded-2xl border border-cyan-100 bg-white/80 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 leading-7 text-slate-600">{item.text}</p>
            </section>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-semibold text-slate-900">How to choose an interview type</h2>
        <p className="mt-4 leading-7 text-slate-600">
          Start with the work the person will do. Choose questions or exercises
          that relate directly to those responsibilities, tell candidates what to
          expect, and use a consistent scorecard. A technical exercise can show
          practical skills; behavioral questions can provide examples of past
          actions; and situational questions can uncover how someone reasons
          through a new challenge.
        </p>
        <p className="mt-4 leading-7 text-slate-600">
          Consistency matters across every format. Prepare questions in advance,
          leave time for candidate questions, and capture notes against clear
          criteria. Learn when a repeatable approach is useful in our guide to{" "}
          <Link className="font-medium text-cyan-800 underline underline-offset-4" href="/guides/structured-vs-unstructured-interviews">
            structured vs. unstructured interviews
          </Link>
          .
        </p>
      </article>
    </main>
  );
}
