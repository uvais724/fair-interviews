"use client"

import { Pencil, Save, Trash2, X } from "lucide-react"
import Link from "next/link"
import { useActionState, useState } from "react"

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogPopup,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"

export type InterviewActionState = {
  success: boolean
  message?: string
  errors?: {
    candidate_name?: string[]
    candidate_role?: string[]
    interview_date?: string[]
    overall_rating?: string[]
    overall_verdict?: string[]
    overall_comments?: string[]
    form?: string[]
  }
}

export type InterviewQuestionActionState = {
  success: boolean
  message?: string
  errors?: {
    actual_time_seconds?: string[]
    rating?: string[]
    notes?: string[]
    form?: string[]
  }
}

type InterviewDetailsProps = {
  interview: {
    id: string
    candidateName: string
    candidateRole: string
    interviewDate: Date
    overallRating?: number | null
    overallVerdict?: string | null
    overallComments?: string | null
    createdAt: Date
    kit?: {
      title: string
    } | null
    questions: {
      id: string
      questionText: string
      orderIndex: number
      allocatedTimeSeconds: number
      actualTimeSeconds?: number | null
      rating?: number | null
      notes?: string | null
    }[]
  }
  updateInterviewAction: (
    state: InterviewActionState,
    formData: FormData
  ) => Promise<InterviewActionState>
  deleteInterviewAction: (
    state: InterviewActionState,
    formData: FormData
  ) => Promise<InterviewActionState>
  updateQuestionAction: (
    state: InterviewQuestionActionState,
    formData: FormData
  ) => Promise<InterviewQuestionActionState>
}

const initialInterviewState: InterviewActionState = {
  success: false,
}

const initialQuestionState: InterviewQuestionActionState = {
  success: false,
}

const verdicts = [
  { value: "select", label: "Select" },
  { value: "hold", label: "Hold" },
  { value: "reject", label: "Reject" },
] as const

function fieldErrors(errors?: string[]) {
  return errors?.map((message) => ({ message }))
}

function toLocalDateTimeValue(value: Date) {
  const offsetMs = value.getTimezoneOffset() * 60 * 1000

  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16)
}

function SelectField({
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
      {...props}
    >
      {children}
    </select>
  )
}

function InterviewQuestionEditor({
  question,
  updateQuestionAction,
}: {
  question: InterviewDetailsProps["interview"]["questions"][number]
  updateQuestionAction: InterviewDetailsProps["updateQuestionAction"]
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [updateState, updateFormAction, isUpdating] = useActionState(
    async (state: InterviewQuestionActionState, formData: FormData) => {
      const nextState = await updateQuestionAction(state, formData)

      if (nextState.success) {
        setIsEditing(false)
      }

      return nextState
    },
    initialQuestionState
  )

  if (!isEditing) {
    return (
      <li className="rounded border p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-sm font-medium text-gray-500">
              Question {question.orderIndex}
            </span>
            <p className="wrap-break-word">{question.questionText}</p>
            <p className="wrap-break-word text-sm text-muted-foreground">
              {question.notes || "No notes captured."}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:items-end">
            <div className="flex flex-col gap-1 text-sm text-gray-600 sm:items-end">
              <span>Rating {question.rating ?? "-"}/5</span>
              <span>
                {question.actualTimeSeconds ?? 0}s /{" "}
                {question.allocatedTimeSeconds}s
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={`Edit question ${question.orderIndex}`}
              title={`Edit question ${question.orderIndex}`}
              onClick={() => setIsEditing(true)}
            >
              <Pencil />
            </Button>
          </div>
        </div>
        {updateState.success && updateState.message && (
          <p className="mt-3 text-sm text-muted-foreground">
            {updateState.message}
          </p>
        )}
      </li>
    )
  }

  return (
    <li className="rounded border p-4">
      <form action={updateFormAction} className="flex flex-col gap-4">
        <input type="hidden" name="question_id" value={question.id} />
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-gray-500">
            Question {question.orderIndex}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Cancel editing question ${question.orderIndex}`}
              title={`Cancel editing question ${question.orderIndex}`}
              onClick={() => setIsEditing(false)}
              disabled={isUpdating}
            >
              <X />
            </Button>
            <Button
              type="submit"
              size="icon-sm"
              aria-label={`Save question ${question.orderIndex}`}
              title={`Save question ${question.orderIndex}`}
              disabled={isUpdating}
            >
              <Save />
            </Button>
          </div>
        </div>
        <p className="wrap-break-word text-sm">{question.questionText}</p>
        <FieldGroup className="gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!updateState.errors?.actual_time_seconds}>
              <FieldLabel htmlFor={`interview-question-${question.id}-time`}>
                Actual Time
              </FieldLabel>
              <InputGroup>
                <Input
                  id={`interview-question-${question.id}-time`}
                  name="actual_time_seconds"
                  type="number"
                  min={0}
                  max={7200}
                  step={30}
                  defaultValue={question.actualTimeSeconds ?? 0}
                  aria-invalid={!!updateState.errors?.actual_time_seconds}
                  required
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>seconds</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldError
                errors={fieldErrors(updateState.errors?.actual_time_seconds)}
              />
            </Field>
            <Field data-invalid={!!updateState.errors?.rating}>
              <FieldLabel htmlFor={`interview-question-${question.id}-rating`}>
                Rating
              </FieldLabel>
              <Input
                id={`interview-question-${question.id}-rating`}
                name="rating"
                type="number"
                min={1}
                max={5}
                step={1}
                defaultValue={question.rating ?? 3}
                aria-invalid={!!updateState.errors?.rating}
                required
              />
              <FieldError errors={fieldErrors(updateState.errors?.rating)} />
            </Field>
          </div>
          <Field data-invalid={!!updateState.errors?.notes}>
            <FieldLabel htmlFor={`interview-question-${question.id}-notes`}>
              Notes
            </FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                id={`interview-question-${question.id}-notes`}
                name="notes"
                defaultValue={question.notes ?? ""}
                rows={4}
                className="min-h-24 resize-none"
                aria-invalid={!!updateState.errors?.notes}
              />
              <InputGroupAddon align="block-end">
                <InputGroupText>500 characters max</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={fieldErrors(updateState.errors?.notes)} />
          </Field>
          {updateState.errors?.form && (
            <FieldError errors={fieldErrors(updateState.errors.form)} />
          )}
        </FieldGroup>
      </form>
    </li>
  )
}

export default function InterviewDetails({
  interview,
  updateInterviewAction,
  deleteInterviewAction,
  updateQuestionAction,
}: InterviewDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [updateState, updateFormAction, isUpdating] = useActionState(
    async (state: InterviewActionState, formData: FormData) => {
      const nextState = await updateInterviewAction(state, formData)

      if (nextState.success) {
        setIsEditing(false)
      }

      return nextState
    },
    initialInterviewState
  )
  const [deleteState, deleteFormAction, isDeleting] = useActionState(
    deleteInterviewAction,
    initialInterviewState
  )

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6">
      <Link
        href="/pages/interviews"
        className="w-fit rounded border px-3 py-2 text-sm hover:bg-gray-50"
      >
        Back to Interviews
      </Link>

      <section className="flex flex-col gap-4 rounded border p-4">
        {isEditing ? (
          <form action={updateFormAction} className="flex flex-col gap-4">
            <input type="hidden" name="interview_id" value={interview.id} />
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold">Edit Interview</h1>
                <p className="text-sm text-muted-foreground">
                  Update candidate details and overall feedback.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Cancel interview editing"
                  title="Cancel interview editing"
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdating}
                >
                  <X />
                </Button>
                <Button
                  type="submit"
                  size="icon-sm"
                  aria-label="Save interview"
                  title="Save interview"
                  disabled={isUpdating}
                >
                  <Save />
                </Button>
              </div>
            </div>
            <FieldGroup className="gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!updateState.errors?.candidate_name}>
                  <FieldLabel htmlFor="interview-edit-candidate-name">
                    Candidate Name
                  </FieldLabel>
                  <Input
                    id="interview-edit-candidate-name"
                    name="candidate_name"
                    defaultValue={interview.candidateName}
                    aria-invalid={!!updateState.errors?.candidate_name}
                    required
                  />
                  <FieldError
                    errors={fieldErrors(updateState.errors?.candidate_name)}
                  />
                </Field>
                <Field data-invalid={!!updateState.errors?.candidate_role}>
                  <FieldLabel htmlFor="interview-edit-candidate-role">
                    Candidate Role
                  </FieldLabel>
                  <Input
                    id="interview-edit-candidate-role"
                    name="candidate_role"
                    defaultValue={interview.candidateRole}
                    aria-invalid={!!updateState.errors?.candidate_role}
                    required
                  />
                  <FieldError
                    errors={fieldErrors(updateState.errors?.candidate_role)}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field data-invalid={!!updateState.errors?.interview_date}>
                  <FieldLabel htmlFor="interview-edit-date">
                    Interview Date
                  </FieldLabel>
                  <Input
                    id="interview-edit-date"
                    name="interview_date"
                    type="datetime-local"
                    defaultValue={toLocalDateTimeValue(interview.interviewDate)}
                    aria-invalid={!!updateState.errors?.interview_date}
                    required
                  />
                  <FieldError
                    errors={fieldErrors(updateState.errors?.interview_date)}
                  />
                </Field>
                <Field data-invalid={!!updateState.errors?.overall_rating}>
                  <FieldLabel htmlFor="interview-edit-rating">
                    Overall Rating
                  </FieldLabel>
                  <Input
                    id="interview-edit-rating"
                    name="overall_rating"
                    type="number"
                    min={1}
                    max={5}
                    step={1}
                    defaultValue={interview.overallRating ?? 3}
                    aria-invalid={!!updateState.errors?.overall_rating}
                    required
                  />
                  <FieldError
                    errors={fieldErrors(updateState.errors?.overall_rating)}
                  />
                </Field>
                <Field data-invalid={!!updateState.errors?.overall_verdict}>
                  <FieldLabel htmlFor="interview-edit-verdict">
                    Verdict
                  </FieldLabel>
                  <SelectField
                    id="interview-edit-verdict"
                    name="overall_verdict"
                    defaultValue={(interview.overallVerdict ?? "HOLD").toLowerCase()}
                    aria-invalid={!!updateState.errors?.overall_verdict}
                  >
                    {verdicts.map((verdict) => (
                      <option key={verdict.value} value={verdict.value}>
                        {verdict.label}
                      </option>
                    ))}
                  </SelectField>
                  <FieldError
                    errors={fieldErrors(updateState.errors?.overall_verdict)}
                  />
                </Field>
              </div>
              <Field data-invalid={!!updateState.errors?.overall_comments}>
                <FieldLabel htmlFor="interview-edit-comments">
                  Overall Feedback
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    id="interview-edit-comments"
                    name="overall_comments"
                    defaultValue={interview.overallComments ?? ""}
                    rows={5}
                    className="min-h-28 resize-none"
                    aria-invalid={!!updateState.errors?.overall_comments}
                    required
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText>1000 characters max</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError
                  errors={fieldErrors(updateState.errors?.overall_comments)}
                />
              </Field>
              {updateState.errors?.form && (
                <FieldError errors={fieldErrors(updateState.errors.form)} />
              )}
            </FieldGroup>
          </form>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-col gap-1">
                <h1 className="wrap-break-word text-2xl font-bold">
                  {interview.candidateName}
                </h1>
                <p className="wrap-break-word text-gray-600">
                  {interview.candidateRole}
                </p>
                <p className="text-sm text-muted-foreground">
                  {interview.kit?.title ?? "Deleted question kit"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Edit interview"
                  title="Edit interview"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger
                    className={buttonVariants({
                      variant: "destructive",
                      size: "icon-sm",
                    })}
                    aria-label="Delete interview"
                    title="Delete interview"
                  >
                    <Trash2 />
                  </AlertDialogTrigger>
                  <AlertDialogPortal>
                    <AlertDialogBackdrop />
                    <AlertDialogPopup>
                      <div className="flex flex-col gap-2">
                        <AlertDialogTitle>Delete interview?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the captured interview for
                          &quot;{interview.candidateName}&quot;. This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </div>
                      <form action={deleteFormAction} className="flex justify-end gap-2">
                        <input
                          type="hidden"
                          name="interview_id"
                          value={interview.id}
                        />
                        <AlertDialogClose
                          type="button"
                          className={buttonVariants({ variant: "outline" })}
                        >
                          Cancel
                        </AlertDialogClose>
                        <Button
                          type="submit"
                          variant="destructive"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete Interview"}
                        </Button>
                      </form>
                      {deleteState.errors?.form && (
                        <FieldError errors={fieldErrors(deleteState.errors.form)} />
                      )}
                    </AlertDialogPopup>
                  </AlertDialogPortal>
                </AlertDialog>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:gap-4">
              <span>{interview.interviewDate.toLocaleString()}</span>
              <span>Rating {interview.overallRating ?? "-"}/5</span>
              <span>{(interview.overallVerdict ?? "No verdict").toLowerCase()}</span>
            </div>
            <p className="wrap-break-word text-sm">
              {interview.overallComments ?? "No overall feedback captured."}
            </p>
            {updateState.success && updateState.message && (
              <p className="text-sm text-muted-foreground">{updateState.message}</p>
            )}
          </>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Captured Questions</h2>
        <ol className="flex flex-col gap-3">
          {interview.questions.map((question) => (
            <InterviewQuestionEditor
              key={question.id}
              question={question}
              updateQuestionAction={updateQuestionAction}
            />
          ))}
        </ol>
      </section>
    </main>
  )
}
