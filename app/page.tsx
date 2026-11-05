import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Layers3,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import interviewsData from "@/mocks/interviews.json";
import kitsData from "@/mocks/question-kits.json";

type InterviewRecord = {
  id: string;
  candidate_name: string;
  candidate_role: string;
  status: "completed" | "in_progress" | "draft";
  overall_rating?: number | null;
  overall_verdict?: string | null;
  interview_date?: string;
};

const interviews = interviewsData as InterviewRecord[];
const kits = kitsData as Array<{
  id: string;
  title: string;
  description: string;
}>;

const totalInterviews = interviews.length;
const completedInterviews = interviews.filter(
  (interview) => interview.status === "completed"
).length;
const activeInterviews = interviews.filter(
  (interview) => interview.status === "in_progress"
).length;
const draftInterviews = interviews.filter(
  (interview) => interview.status === "draft"
).length;
const ratings = interviews
  .map((interview) => interview.overall_rating)
  .filter((rating): rating is number => typeof rating === "number");
const averageRating =
  ratings.length > 0
    ? (ratings.reduce((total, rating) => total + rating, 0) / ratings.length).toFixed(1)
    : "—";
const completionRate = totalInterviews
  ? Math.round((completedInterviews / totalInterviews) * 100)
  : 0;

const stats = [
  {
    title: "Total interviews",
    value: totalInterviews.toString(),
    detail: `${completedInterviews} completed so far`,
    icon: Users,
  },
  {
    title: "Completion rate",
    value: `${completionRate}%`,
    detail: `${draftInterviews} drafts in progress`,
    icon: CheckCircle2,
  },
  {
    title: "Active pipeline",
    value: activeInterviews.toString(),
    detail: "Candidates currently in review",
    icon: BriefcaseBusiness,
  },
  {
    title: "Avg. rating",
    value: averageRating.toString(),
    detail: "Across completed interviews",
    icon: TrendingUp,
  },
];

const statusClasses: Record<InterviewRecord["status"], string> = {
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  in_progress: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  draft: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

const formattedStatus = (status: InterviewRecord["status"]) =>
  status.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-4 rounded-2xl border bg-gradient-to-br from-background to-muted/50 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            Interview overview
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Keep an eye on your hiring pipeline, candidate progress, and the question
            kits driving each evaluation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/pages/interviews"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Review pipeline
          </Link>
          <Link
            href="/pages/question-kits"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Manage kits
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, value, detail, icon: Icon }) => (
          <Card key={title} className="border border-border/80 bg-card/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
              <div className="rounded-md bg-muted p-2 text-foreground">
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">{value}</div>
              <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        <Card className="border border-border/80 bg-card/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Recent interviews</CardTitle>
              <CardDescription>Latest activity across your candidates</CardDescription>
            </div>
            <Link
              href="/pages/interviews"
              className="inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View all
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </CardHeader>

          <CardContent className="space-y-3">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-3 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{interview.candidate_name}</p>
                  <p className="text-sm text-muted-foreground">{interview.candidate_role}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${statusClasses[interview.status]}`}
                  >
                    {formattedStatus(interview.status)}
                  </span>
                  <div className="text-right text-sm">
                    <p className="font-medium text-foreground">
                      {interview.overall_rating ?? "—"}
                    </p>
                    <p className="text-muted-foreground">rating</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle>Question kit coverage</CardTitle>
            <CardDescription>Available interview kits vs active usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Available kits</span>
                <span className="font-medium text-foreground">{kits.length}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min((kits.length / 5) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {kits.slice(0, 3).map((kit) => (
                <div key={kit.id} className="rounded-lg border bg-card px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-primary/10 p-1.5 text-primary">
                        <Layers3 className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{kit.title}</p>
                        <p className="text-xs text-muted-foreground">{kit.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
