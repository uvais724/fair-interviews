-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "InterviewVerdict" AS ENUM ('SELECT', 'REJECT', 'HOLD');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_kits" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_kits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "kit_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "default_time_seconds" INTEGER NOT NULL,
    "tag" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "candidate_name" TEXT NOT NULL,
    "candidate_role" TEXT NOT NULL,
    "kit_id" TEXT,
    "status" "InterviewStatus" NOT NULL DEFAULT 'DRAFT',
    "overall_rating" INTEGER,
    "overall_verdict" "InterviewVerdict",
    "overall_comments" TEXT,
    "interview_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_questions" (
    "id" TEXT NOT NULL,
    "interview_id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "allocated_time_seconds" INTEGER NOT NULL,
    "actual_time_seconds" INTEGER,
    "rating" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "question_kits_user_id_idx" ON "question_kits"("user_id");

-- CreateIndex
CREATE INDEX "questions_kit_id_idx" ON "questions"("kit_id");

-- CreateIndex
CREATE UNIQUE INDEX "questions_kit_id_order_index_key" ON "questions"("kit_id", "order_index");

-- CreateIndex
CREATE INDEX "interviews_user_id_idx" ON "interviews"("user_id");

-- CreateIndex
CREATE INDEX "interviews_kit_id_idx" ON "interviews"("kit_id");

-- CreateIndex
CREATE INDEX "interviews_status_idx" ON "interviews"("status");

-- CreateIndex
CREATE INDEX "interview_questions_interview_id_idx" ON "interview_questions"("interview_id");

-- CreateIndex
CREATE UNIQUE INDEX "interview_questions_interview_id_order_index_key" ON "interview_questions"("interview_id", "order_index");

-- AddForeignKey
ALTER TABLE "question_kits" ADD CONSTRAINT "question_kits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_kit_id_fkey" FOREIGN KEY ("kit_id") REFERENCES "question_kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_kit_id_fkey" FOREIGN KEY ("kit_id") REFERENCES "question_kits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_questions" ADD CONSTRAINT "interview_questions_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
