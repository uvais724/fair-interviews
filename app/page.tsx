import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Layers3,
  TrendingUp,
  Users,
} from "lucide-react";

import { auth } from "@/auth";
import { LandingPage } from "@/components/landing-page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";

async function getDashboardData(userId: string) {
  if (!process.env.DATABASE_URL) {
    return { interviews: [], kits: [] };
  }

  const [interviews, kits] = await Promise.all([
    prisma.interview.findMany({
      where: { userId },
      orderBy: {
        interviewDate: "desc",
      },
      take: 4,
      include: {
        kit: true,
        questions: true,
      },
    }),
    prisma.questionKit.findMany({
      where: { userId },
      orderBy: {
        updatedAt: "desc",
      },
      take: 3,
    }),
  ]);

  return { interviews, kits };
}

const statusClasses = {
  DRAFT: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  IN_PROGRESS: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  COMPLETED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
} as const;

const formattedStatus = (status: keyof typeof statusClasses) =>
  status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    return <LandingPage />;
  }

  const { interviews, kits } = await getDashboardData(session.user.id);

  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter(
    (interview) => interview.status === "COMPLETED"
  ).length;
  const activeInterviews = interviews.filter(
    (interview) => interview.status === "IN_PROGRESS"
  ).length;
  const draftInterviews = interviews.filter(
    (interview) => interview.status === "DRAFT"
  ).length;
  const ratings = interviews
    .map((interview) => interview.overallRating)
    .filter((rating): rating is number => typeof rating === "number");
  const averageRating =
    ratings.length > 0
      ? (
          ratings.reduce((total, rating) => total + rating, 0) / ratings.length
        ).toFixed(1)
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

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-4 rounded-2xl border bg-linear-to-br from-background to-muted/50 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
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
            {interviews.length > 0 ? (
              interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-3 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{interview.candidateName}</p>
                    <p className="text-sm text-muted-foreground">{interview.candidateRole}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${statusClasses[interview.status]}`}
                    >
                      {formattedStatus(interview.status)}
                    </span>
                    <div className="text-right text-sm">
                      <p className="font-medium text-foreground">
                        {interview.overallRating ?? "—"}
                      </p>
                      <p className="text-muted-foreground">rating</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                No interviews are available yet. Go ahead start capturing your first candidate evaluation!
              </div>
            )}
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
              {kits.length > 0 ? (
                kits.map((kit) => (
                  <div key={kit.id} className="rounded-lg border bg-card px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="rounded-md bg-primary/10 p-1.5 text-primary">
                          <Layers3 className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{kit.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {kit.description ?? "No description available"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                  No kits are available! Create a new question kit to start capturing interviews.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
