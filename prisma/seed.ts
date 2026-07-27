import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

type SeedInterviewQuestionInput = {
  questionText: string;
  orderIndex: number;
  allocatedTimeSeconds: number;
  actualTimeSeconds?: number;
  rating?: number;
  notes?: string;
};

type SeedInterviewInput = {
  candidateName: string;
  candidateRole: string;
  interviewDate: Date;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED";
  overallRating?: number;
  overallVerdict?: "SELECT" | "REJECT" | "HOLD";
  overallComments?: string;
  questions: SeedInterviewQuestionInput[];
};

type SeedQuestionInput = {
  text: string;
  orderIndex: number;
  defaultTimeSeconds: number;
  tag?: string;
};

type SeedQuestionKitInput = {
  title: string;
  description?: string;
  questions: SeedQuestionInput[];
  interviews?: SeedInterviewInput[];
};

type SeedUserInput = {
  name: string;
  email: string;
  questionKits: SeedQuestionKitInput[];
};

const userData: SeedUserInput[] = [
  {
    name: "Ava Patel",
    email: "ava.patel@example.com",
    questionKits: [
      {
        title: "Frontend Engineering",
        description: "A starter kit for evaluating frontend engineering candidates.",
        questions: [
          {
            text: "Describe a time you improved performance in a React application.",
            orderIndex: 1,
            defaultTimeSeconds: 180,
            tag: "React",
          },
          {
            text: "How do you approach accessibility in your UI work?",
            orderIndex: 2,
            defaultTimeSeconds: 180,
            tag: "Accessibility",
          },
          {
            text: "Walk me through how you would debug a flaky test.",
            orderIndex: 3,
            defaultTimeSeconds: 240,
            tag: "Testing",
          },
        ],
        interviews: [
          {
            candidateName: "Mina Chen",
            candidateRole: "Senior Frontend Engineer",
            interviewDate: new Date("2026-07-20T10:00:00.000Z"),
            status: "IN_PROGRESS",
            overallRating: 4,
            overallVerdict: "HOLD",
            overallComments:
              "Strong technical depth and communication, but needs more evidence of product tradeoff thinking.",
            questions: [
              {
                questionText: "Describe a time you improved performance in a React application.",
                orderIndex: 1,
                allocatedTimeSeconds: 180,
                actualTimeSeconds: 160,
                rating: 4,
                notes: "Provided a concrete example with measurable gains.",
              },
              {
                questionText: "How do you approach accessibility in your UI work?",
                orderIndex: 2,
                allocatedTimeSeconds: 180,
                actualTimeSeconds: 170,
                rating: 3,
                notes: "Covered alt text, semantics, and keyboard navigation.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Noah Brooks",
    email: "noah.brooks@example.com",
    questionKits: [
      {
        title: "Product-minded Engineering",
        description: "Questions focused on ownership, collaboration, and delivery impact.",
        questions: [
          {
            text: "Tell me about a project where you influenced priorities.",
            orderIndex: 1,
            defaultTimeSeconds: 240,
            tag: "Leadership",
          },
          {
            text: "How do you resolve disagreements with cross-functional partners?",
            orderIndex: 2,
            defaultTimeSeconds: 180,
            tag: "Collaboration",
          },
        ],
      },
    ],
  },
];

export async function main() {
  await prisma.interviewQuestion.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.question.deleteMany();
  await prisma.questionKit.deleteMany();
  await prisma.user.deleteMany();

  for (const seedUser of userData) {
    const user = await prisma.user.create({
      data: {
        name: seedUser.name,
        email: seedUser.email,
      },
    });

    for (const kit of seedUser.questionKits) {
      const createdKit = await prisma.questionKit.create({
        data: {
          userId: user.id,
          title: kit.title,
          description: kit.description,
        },
      });

      for (const question of kit.questions) {
        await prisma.question.create({
          data: {
            kitId: createdKit.id,
            text: question.text,
            orderIndex: question.orderIndex,
            defaultTimeSeconds: question.defaultTimeSeconds,
            tag: question.tag,
          },
        });
      }

      for (const interview of kit.interviews ?? []) {
        const createdInterview = await prisma.interview.create({
          data: {
            userId: user.id,
            candidateName: interview.candidateName,
            candidateRole: interview.candidateRole,
            kitId: createdKit.id,
            status: interview.status,
            overallRating: interview.overallRating,
            overallVerdict: interview.overallVerdict,
            overallComments: interview.overallComments,
            interviewDate: interview.interviewDate,
          },
        });

        for (const question of interview.questions) {
          await prisma.interviewQuestion.create({
            data: {
              interviewId: createdInterview.id,
              questionText: question.questionText,
              orderIndex: question.orderIndex,
              allocatedTimeSeconds: question.allocatedTimeSeconds,
              actualTimeSeconds: question.actualTimeSeconds,
              rating: question.rating,
              notes: question.notes,
            },
          });
        }
      }
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });