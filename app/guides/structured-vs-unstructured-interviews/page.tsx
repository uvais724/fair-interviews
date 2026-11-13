import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Structured vs. Unstructured Interviews: Key Differences",
  description:
    "Compare structured and unstructured job interviews, understand their trade-offs, and learn how to build a consistent interview process.",
  alternates: { canonical: "/guides/structured-vs-unstructured-interviews" },
};

export default function StructuredVsUnstructuredPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <article>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Hiring guide
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Structured vs. Unstructured Interviews
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          The difference between a structured and unstructured interview is how
          much of the conversation is planned in advance. Structured interviews
          use shared questions and evaluation criteria. Unstructured interviews
          are more open-ended and let the conversation change from candidate to
          candidate. Each format has a place, but the choice affects how reliably
          a team can compare candidates.
        </p>

        <h2 className="mt-12 text-2xl font-semibold text-slate-900">What is a structured interview?</h2>
        <p className="mt-4 leading-7 text-slate-600">
          In a structured job interview, interviewers prepare a common set of
          job-related questions, ask them consistently, and assess answers using
          the same rubric or scorecard. Follow-up questions can clarify an
          answer, while the core topics and standards remain comparable.
        </p>
        <p className="mt-4 leading-7 text-slate-600">
          This format supports consistent evaluation, makes it easier to discuss
          evidence rather than impressions, and helps interviewers stay aligned
          on what the role requires. It takes preparation, and an overly rigid
          script can feel impersonal, so leave room for natural follow-ups and
          candidate questions.
        </p>

        <h2 className="mt-12 text-2xl font-semibold text-slate-900">What is an unstructured interview?</h2>
        <p className="mt-4 leading-7 text-slate-600">
          An unstructured interview has no fixed question list or shared scoring
          rubric. The interviewer guides a flexible conversation and chooses
          follow-ups as topics arise. This can make it easier to explore a
          candidate’s experience in depth and build rapport.
        </p>
        <p className="mt-4 leading-7 text-slate-600">
          The trade-off is that candidates may be asked different questions and
          judged by different standards. First impressions or unrelated topics
          can carry too much weight, and it becomes harder to compare feedback
          across interviewers.
        </p>

        <h2 className="mt-12 text-2xl font-semibold text-slate-900">Structured vs. unstructured interviews at a glance</h2>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-cyan-100 bg-white/80">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="bg-cyan-50 text-slate-900">
              <tr><th className="p-4 font-semibold">Factor</th><th className="p-4 font-semibold">Structured</th><th className="p-4 font-semibold">Unstructured</th></tr>
            </thead>
            <tbody className="divide-y divide-cyan-100 text-slate-600">
              <tr><th className="p-4 font-medium text-slate-800">Questions</th><td className="p-4">Shared core questions</td><td className="p-4">Flexible conversation</td></tr>
              <tr><th className="p-4 font-medium text-slate-800">Evaluation</th><td className="p-4">Common criteria or scorecard</td><td className="p-4">Interviewer judgment</td></tr>
              <tr><th className="p-4 font-medium text-slate-800">Comparison</th><td className="p-4">More consistent across candidates</td><td className="p-4">Can be harder to compare</td></tr>
              <tr><th className="p-4 font-medium text-slate-800">Flexibility</th><td className="p-4">Planned, with room for follow-ups</td><td className="p-4">High</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-12 text-2xl font-semibold text-slate-900">Which interview approach should you use?</h2>
        <p className="mt-4 leading-7 text-slate-600">
          For most hiring decisions, a structured approach is a useful foundation:
          define the skills needed, prepare the same core prompts, and evaluate
          responses against clear criteria. Interviewers can still ask relevant
          follow-up questions and hold a conversational discussion. The aim is
          not to make every conversation identical; it is to make the evidence
          and standards fairer to compare.
        </p>
        <p className="mt-4 leading-7 text-slate-600">
          A reusable question kit and interview notes can help a team follow that
          process from one candidate to the next. For a wider look at formats,
          read our guide to <Link className="font-medium text-cyan-800 underline underline-offset-4" href="/guides/types-of-interviews">types of job interviews</Link>.
        </p>
      </article>
    </main>
  );
}
