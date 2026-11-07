"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Play, RotateCcw, Send, Star } from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"
import * as z from "zod"

import { getQuestions } from "@/app/actions/getQuestions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
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
import { interviewCaptureSchema } from "@/lib/interview-validation"
import { secondsToMinutes } from "@/lib/utils"
import { InterviewQrCode } from "@/components/interviews/InterviewQrCode"

const startSchema = interviewCaptureSchema.pick({
  candidate_name: true,
  candidate_role: true,
  interview_date: true,
  kit_id: true,
})
const captureSchema = interviewCaptureSchema.pick({
  questions: true,
  overall_rating: true,
  overall_verdict: true,
  overall_comments: true,
}).extend({
  questions: z.array(
    z.object({
      question_id: z.string().min(1),
      question_text: z.string().trim().min(1),
      order_index: z.number().int().min(1),
      allocated_time_seconds: z.number().int().min(0).max(7200),
      actual_time_seconds: z.coerce
        .number()
        .min(0, "Actual time cannot be negative.")
        .max(120, "Actual time must be at most 120 minutes."),
      rating: z.coerce.number().int().min(1).max(5),
      notes: z.string().trim().max(500),
    })
  ).min(1, "The selected kit needs at least one question."),
})

type StartFormValues = z.infer<typeof startSchema>
type CaptureFormInput = z.input<typeof captureSchema>
type CaptureFormValues = z.output<typeof captureSchema>

const verdicts = [
  { value: "select", label: "Select" },
  { value: "hold", label: "Hold" },
  { value: "reject", label: "Reject" },
] as const

type Kit = {
  id: string
  title: string
  description?: string | null
}

type KitQuestion = {
  id: string
  kit_id: string
  text: string
  order_index: number
  default_time_seconds: number
}

type QuestionTimerState = {
  isRunning: boolean
  startedAt: number | null
  elapsedMs: number
  status: "idle" | "running" | "paused" | "timeout"
}

type QuestionTimerTrigger = {
  id: string
  default_time_seconds: number
}

function getLocalDateTimeValue() {
  const now = new Date()
  const offsetMs = now.getTimezoneOffset() * 60 * 1000

  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16)
}

function getKitQuestions(kitId: string, availableQuestions: KitQuestion[]) {
  return availableQuestions
    .filter((question) => question.kit_id === kitId)
    .sort((first, second) => first.order_index - second.order_index)
}

const ratingNoteMessages = [
  "Candidate showed significant gaps in this area and would need substantial support.",
  "Candidate showed some relevant understanding, but there were clear gaps and limited depth.",
  "Candidate met expectations with a generally solid answer and reasonable examples.",
  "Candidate performed well with clear reasoning and strong examples.",
  "Candidate delivered an excellent answer with depth, confidence, and strong examples.",
] as const

function getRatingNoteText(rating: number) {
  const normalizedRating = Math.min(5, Math.max(1, Number.isFinite(rating) ? Math.round(rating) : 3))

  return ratingNoteMessages[normalizedRating - 1]
}

function StarRating({
  value,
  onChange,
  label,
}: {
  value: number
  onChange: (value: number) => void
  label: string
}) {
  const normalizedValue = Math.min(5, Math.max(0, Number(value) || 0))

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex items-center gap-1.5"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= normalizedValue

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            aria-checked={active}
            className="rounded-sm p-0.5 text-amber-500 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => onChange(star)}
          >
            <Star
              className="h-6 w-6"
              fill={active ? "currentColor" : "none"}
              strokeWidth={1.8}
            />
          </button>
        )
      })}
    </div>
  )
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

type InterviewCaptureProps = {
  action: (formData: FormData) => Promise<void>
}

export function InterviewCapture({ action }: InterviewCaptureProps) {
  const [isPending, startTransition] = React.useTransition()
  const [startedInterview, setStartedInterview] =
    React.useState<StartFormValues | null>(null)
  const [availableKits, setAvailableKits] = React.useState<Kit[]>([])
  const [availableQuestions, setAvailableQuestions] = React.useState<KitQuestion[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = React.useState(true)
  const [questionTimers, setQuestionTimers] = React.useState<
    Record<string, QuestionTimerState>
  >({})
  const noteTouchedMap = React.useRef<Record<number, boolean>>({})
  const noteDefaultMap = React.useRef<Record<number, string>>({})
  const manualActualTimeMap = React.useRef<Record<string, boolean>>({})

  function resetQuestionNotesState() {
    noteTouchedMap.current = {}
    noteDefaultMap.current = {}
  }

  function getQuestionTimer(questionId: string): QuestionTimerState {
    return (
      questionTimers[questionId] ?? {
        isRunning: false,
        startedAt: null,
        elapsedMs: 0,
        status: "idle",
      }
    )
  }

  function toggleQuestionTimer(question: QuestionTimerTrigger) {
    const currentTimer = getQuestionTimer(question.id)

    if (currentTimer.status === "timeout") {
      return
    }

    if (currentTimer.isRunning) {
      setQuestionTimers((previous) => ({
        ...previous,
        [question.id]: {
          ...currentTimer,
          isRunning: false,
          startedAt: null,
          status: "paused",
          elapsedMs: currentTimer.elapsedMs,
        },
      }))
      return
    }

    const totalMs = question.default_time_seconds * 1000
    const nextElapsedMs = Math.min(currentTimer.elapsedMs, totalMs)
    const questionIndex = questionFields.findIndex(
      (field) => field.question_id === question.id,
    )

    setQuestionTimers((previous) => ({
      ...previous,
      [question.id]: {
        isRunning: true,
        startedAt: Date.now() - nextElapsedMs,
        elapsedMs: nextElapsedMs,
        status: "running",
      },
    }))

    if (questionIndex >= 0) {
      captureForm.setValue(
        `questions.${questionIndex}.actual_time_seconds`,
        0,
        { shouldDirty: true, shouldTouch: true },
      )
    }
  }

  React.useEffect(() => {

    let active = true

    async function loadQuestions() {
      try {
        const data = await getQuestions()

        if (active) {
          setAvailableKits(data.kits)
          setAvailableQuestions(data.questions)
        }
      } catch (error) {
        console.error("Failed to load question kits", error)

        if (active) {
          setAvailableKits([])
          setAvailableQuestions([])
        }
      } finally {
        if (active) {
          setIsLoadingQuestions(false)
        }
      }
    }

    void loadQuestions()

    return () => {
      active = false
    }
  }, [])

  const startForm = useForm<StartFormValues>({
    resolver: zodResolver(startSchema),
    defaultValues: {
      candidate_name: "",
      candidate_role: "",
      interview_date: getLocalDateTimeValue(),
      kit_id: "",
    },
  })

  const captureForm = useForm<CaptureFormInput, unknown, CaptureFormValues>({
    resolver: zodResolver(captureSchema),
    defaultValues: {
      questions: [],
      overall_rating: 3,
      overall_verdict: "hold",
      overall_comments: "",
    },
  })

  const selectedKitId = useWatch({
    control: startForm.control,
    name: "kit_id",
  })
  const questionFields = useWatch({
    control: captureForm.control,
    name: "questions",
  })
  const selectedKit = availableKits.find((kit) => kit.id === selectedKitId)
  const selectedQuestions = getKitQuestions(selectedKitId ?? "", availableQuestions)

  React.useEffect(() => {
    const activeTimerIds = questionFields
      .map((field) => field.question_id)
      .filter((questionId) => {
        const timer = questionTimers[questionId]
        return timer?.isRunning && timer.startedAt !== null
      })

    if (activeTimerIds.length === 0) {
      return
    }

    const intervalId = window.setInterval(() => {
      setQuestionTimers((previous) => {
        let changed = false
        const nextTimers = { ...previous }

        for (const questionId of activeTimerIds) {
          const timer = nextTimers[questionId]
          const question = questionFields.find(
            (field) => field.question_id === questionId,
          )

          if (!timer || !question || !timer.isRunning || timer.startedAt === null) {
            continue
          }

          const nextElapsedMs = Date.now() - timer.startedAt
          const totalTimeMs = question.allocated_time_seconds * 1000

          if (nextElapsedMs >= totalTimeMs) {
            nextTimers[questionId] = {
              ...timer,
              isRunning: false,
              startedAt: null,
              elapsedMs: totalTimeMs,
              status: "timeout",
            }
            changed = true
            continue
          }

          if (timer.elapsedMs !== nextElapsedMs) {
            nextTimers[questionId] = {
              ...timer,
              elapsedMs: nextElapsedMs,
              status: "running",
            }
            changed = true
          }
        }

        return changed ? nextTimers : previous
      })
    }, 100)

    return () => window.clearInterval(intervalId)
  }, [questionFields, questionTimers])

  React.useEffect(() => {
    questionFields.forEach((question, index) => {
      const timer = questionTimers[question.question_id]
      const isManualOverride = manualActualTimeMap.current[question.question_id]

      if (isManualOverride) {
        return
      }

      if (!timer) {
        if (Number(captureForm.getValues(`questions.${index}.actual_time_seconds`)) !== 0) {
          captureForm.setValue(`questions.${index}.actual_time_seconds`, 0, {
            shouldDirty: true,
            shouldTouch: true,
          })
        }
        return
      }

      const nextActualMinutes =
        timer.status === "timeout"
          ? Number((question.allocated_time_seconds / 60).toFixed(1))
          : Number((timer.elapsedMs / 60000).toFixed(1))

      const currentActualMinutes = Number(
        captureForm.getValues(`questions.${index}.actual_time_seconds`),
      )

      if (currentActualMinutes !== nextActualMinutes) {
        captureForm.setValue(
          `questions.${index}.actual_time_seconds`,
          nextActualMinutes,
          { shouldDirty: true, shouldTouch: true },
        )
      }
    })
  }, [captureForm, questionFields, questionTimers])

  function startInterview(data: StartFormValues) {
    const kitQuestions = getKitQuestions(data.kit_id, availableQuestions)

    setQuestionTimers({})
    resetQuestionNotesState()
    captureForm.reset({
      questions: kitQuestions.map((question) => ({
        question_id: question.id,
        question_text: question.text,
        order_index: question.order_index,
        allocated_time_seconds: question.default_time_seconds,
        actual_time_seconds: 0,
        rating: 3,
        notes: getRatingNoteText(3),
      })),
      overall_rating: 3,
      overall_verdict: "hold",
      overall_comments: "",
    })
    setStartedInterview(data)
  }

  function resetQuestionTimer(questionId: string) {
    manualActualTimeMap.current[questionId] = false
    setQuestionTimers((previous) => ({
      ...previous,
      [questionId]: {
        isRunning: false,
        startedAt: null,
        elapsedMs: 0,
        status: "idle",
      },
    }))

    const questionIndex = questionFields.findIndex(
      (field) => field.question_id === questionId,
    )

    if (questionIndex >= 0) {
      captureForm.setValue(
        `questions.${questionIndex}.actual_time_seconds`,
        0,
        { shouldDirty: true, shouldTouch: true },
      )
    }
  }

  function resetInterview() {
    resetQuestionNotesState()
    setQuestionTimers({})
    setStartedInterview(null)
    captureForm.reset()
  }

  function submitInterview(data: CaptureFormValues) {
    if (!startedInterview) {
      return
    }

    const formData = new FormData()
    formData.set("candidate_name", startedInterview.candidate_name)
    formData.set("candidate_role", startedInterview.candidate_role)
    formData.set("interview_date", startedInterview.interview_date)
    formData.set("kit_id", startedInterview.kit_id)
    formData.set("overall_rating", data.overall_rating.toString())
    formData.set("overall_verdict", data.overall_verdict)
    formData.set("overall_comments", data.overall_comments)
    formData.set("questions", JSON.stringify(data.questions))

    startTransition(() => {
      void action(formData)
    })
  }

  if (isLoadingQuestions) {
    return (
      <Card className="w-full sm:max-w-5xl">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Loading question kits...
        </CardContent>
      </Card>
    )
  }

  if (startedInterview) {
    const activeKit = availableKits.find((kit) => kit.id === startedInterview.kit_id)

    return (
      <Card className="w-full sm:max-w-5xl">
        <CardHeader>
          <CardTitle>Capture Interview</CardTitle>
          <CardDescription>
            {startedInterview.candidate_name} for{" "}
            {startedInterview.candidate_role}
            {activeKit ? ` using ${activeKit.title}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="interview-capture-form"
            onSubmit={(event) => {
              void captureForm.handleSubmit(submitInterview)(event)
            }}
          >
            <FieldGroup>
              {questionFields.map((question, index) => {
                const timer = getQuestionTimer(question.question_id)
                const totalTimeMs = question.allocated_time_seconds * 1000
                const progress =
                  timer.status === "timeout"
                    ? 100
                    : Math.min(100, (timer.elapsedMs / totalTimeMs) * 100 || 0)

                return (
                  <div
                    key={question.question_id}
                    className="relative overflow-hidden rounded-lg border p-4"
                  >
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-y-0 left-0 transition-all duration-200 ${
                        timer.status === "timeout"
                          ? "bg-red-500/30"
                          : timer.isRunning
                            ? "bg-amber-500/20"
                            : "bg-slate-200/60"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                    <div className="relative">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            Question {question.order_index}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {question.question_text}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-muted-foreground">
                            {secondsToMinutes(question.allocated_time_seconds)} min allocated
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant={
                                timer.status === "timeout"
                                  ? "destructive"
                                  : timer.isRunning
                                    ? "secondary"
                                    : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                toggleQuestionTimer({
                                  id: question.question_id,
                                  default_time_seconds: question.allocated_time_seconds,
                                })
                              }
                              disabled={timer.status === "timeout"}
                            >
                              {timer.status === "timeout"
                                ? "Timeout"
                                : timer.isRunning
                                  ? "Stop"
                                  : "Start Timer"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => resetQuestionTimer(question.question_id)}
                            >
                              Reset Time
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Controller
                          name={`questions.${index}.allocated_time_seconds`}
                          control={captureForm.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel
                                htmlFor={`interview-question-${index}-allocated-time`}
                              >
                                Allocated Time (minutes)
                              </FieldLabel>
                              <InputGroup>
                                <Input
                                  {...field}
                                  value={secondsToMinutes(field.value) as number | string}
                                  id={`interview-question-${index}-allocated-time`}
                                  type="number"
                                  min={0}
                                  max={120}
                                  step={0.1}
                                  aria-invalid={fieldState.invalid}
                                  onChange={(event) => {
                                    const nextMinutes = Number(event.target.value) || 0
                                    field.onChange(Math.round(nextMinutes * 60))
                                  }}
                                />
                                <InputGroupAddon align="inline-end">
                                  <InputGroupText>minutes</InputGroupText>
                                </InputGroupAddon>
                              </InputGroup>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                        <Controller
                          name={`questions.${index}.actual_time_seconds`}
                          control={captureForm.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel
                                htmlFor={`interview-question-${index}-time`}
                              >
                                Actual Time (minutes)
                              </FieldLabel>
                              <InputGroup>
                                <Input
                                  {...field}
                                  value={field.value === "" ? "" : (field.value as number | string)}
                                  id={`interview-question-${index}-time`}
                                  type="number"
                                  min={0}
                                  max={120}
                                  step={0.1}
                                  aria-invalid={fieldState.invalid}
                                  onFocus={() => {
                                    const timer = getQuestionTimer(question.question_id)
                                    if (timer.isRunning) {
                                      setQuestionTimers((previous) => ({
                                        ...previous,
                                        [question.question_id]: {
                                          ...timer,
                                          isRunning: false,
                                          startedAt: null,
                                          status: "paused",
                                          elapsedMs: timer.elapsedMs,
                                        },
                                      }))
                                    }
                                    manualActualTimeMap.current[question.question_id] = true
                                  }}
                                  onChange={(event) => {
                                    const rawValue = event.target.value

                                    if (rawValue === "") {
                                      manualActualTimeMap.current[question.question_id] = false
                                      field.onChange("")
                                      setQuestionTimers((previous) => ({
                                        ...previous,
                                        [question.question_id]: {
                                          isRunning: false,
                                          startedAt: null,
                                          elapsedMs: 0,
                                          status: "paused",
                                        },
                                      }))
                                      return
                                    }

                                    const nextValue = Math.min(
                                      120,
                                      Math.max(0, Number(rawValue) || 0),
                                    )
                                    manualActualTimeMap.current[question.question_id] = false
                                    field.onChange(nextValue)
                                    setQuestionTimers((previous) => ({
                                      ...previous,
                                      [question.question_id]: {
                                        isRunning: false,
                                        startedAt: null,
                                        elapsedMs: nextValue * 60000,
                                        status: "paused",
                                      },
                                    }))
                                  }}
                                />
                                <InputGroupAddon align="inline-end">
                                  <InputGroupText>minutes</InputGroupText>
                                </InputGroupAddon>
                              </InputGroup>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                        <Controller
                          name={`questions.${index}.rating`}
                          control={captureForm.control}
                          render={({ field, fieldState }) => {
                            const noteFieldName = `questions.${index}.notes` as const

                            return (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                  htmlFor={`interview-question-${index}-rating`}
                                >
                                  Rating
                                </FieldLabel>
                                <div
                                  id={`interview-question-${index}-rating`}
                                  className="rounded-md border border-input bg-background px-2 py-2"
                                >
                                  <StarRating
                                    value={Number(field.value) || 0}
                                    label={`Question ${question.order_index} rating`}
                                    onChange={(nextValue) => {
                                      field.onChange(nextValue)

                                      const updatedNote = getRatingNoteText(nextValue)

                                      noteDefaultMap.current[index] = updatedNote
                                      captureForm.setValue(noteFieldName, updatedNote, {
                                        shouldDirty: true,
                                        shouldTouch: true,
                                      })
                                    }}
                                  />
                                </div>
                                <FieldDescription>
                                  Tap a star to score this answer.
                                </FieldDescription>
                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                            )
                          }}
                        />
                      </div>
                      <Controller
                        name={`questions.${index}.notes`}
                        control={captureForm.control}
                        render={({ field, fieldState }) => (
                          <Field className="mt-4" data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={`interview-question-${index}-notes`}>
                              Notes
                            </FieldLabel>
                            <InputGroup>
                              <InputGroupTextarea
                                {...field}
                                id={`interview-question-${index}-notes`}
                                placeholder="Record the candidate's answer quality, gaps, and examples."
                                rows={4}
                                className="min-h-24 resize-none"
                                aria-invalid={fieldState.invalid}
                                onChange={(event) => {
                                  noteTouchedMap.current[index] = true
                                  field.onChange(event.target.value)
                                }}
                              />
                              <InputGroupAddon align="block-end">
                                <InputGroupText className="tabular-nums">
                                  {field.value.length}/500 characters
                                </InputGroupText>
                              </InputGroupAddon>
                            </InputGroup>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>
                  </div>
                )
              })}
              <div className="rounded-lg border p-4">
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Controller
                      name="overall_rating"
                      control={captureForm.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="interview-overall-rating">
                            Overall Rating
                          </FieldLabel>
                          <div
                            id="interview-overall-rating"
                            className="rounded-md border border-input bg-background px-2 py-2"
                          >
                            <StarRating
                              value={Number(field.value) || 0}
                              label="Overall rating"
                              onChange={(nextValue) => field.onChange(nextValue)}
                            />
                          </div>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      name="overall_verdict"
                      control={captureForm.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="interview-overall-verdict">
                            Verdict
                          </FieldLabel>
                          <SelectField
                            {...field}
                            id="interview-overall-verdict"
                            aria-invalid={fieldState.invalid}
                          >
                            {verdicts.map((verdict) => (
                              <option key={verdict.value} value={verdict.value}>
                                {verdict.label}
                              </option>
                            ))}
                          </SelectField>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>
                  <Controller
                    name="overall_comments"
                    control={captureForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="interview-overall-comments">
                          Overall Feedback
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupTextarea
                            {...field}
                            id="interview-overall-comments"
                            placeholder="Summarize strengths, risks, and the hiring decision."
                            rows={5}
                            className="min-h-28 resize-none"
                            aria-invalid={fieldState.invalid}
                          />
                          <InputGroupAddon align="block-end">
                            <InputGroupText className="tabular-nums">
                              {field.value.length}/1000 characters
                            </InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="justify-between gap-3">
          <Button type="button" variant="outline" onClick={resetInterview}>
            <RotateCcw />
            Start Over
          </Button>
          <Button type="submit" form="interview-capture-form" disabled={isPending}>
            <Send />
            {isPending ? "Logging..." : "Log Interview"}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full sm:max-w-3xl">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Start Interview</CardTitle>
        <CardDescription>
          Add candidate details and choose the question kit for this session.
        </CardDescription>
          </div>
          <InterviewQrCode href="/pages/interviews/create" />
        </div>
      </CardHeader>
      <CardContent>
        <form
          id="interview-start-form"
          onSubmit={(event) => {
            void startForm.handleSubmit(startInterview)(event)
          }}
        >
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="candidate_name"
                control={startForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="interview-candidate-name">
                      Candidate Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="interview-candidate-name"
                      placeholder="John Smith"
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="candidate_role"
                control={startForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="interview-candidate-title">
                      Candidate Role
                    </FieldLabel>
                    <Input
                      {...field}
                      id="interview-candidate-title"
                      placeholder="Senior Java Developer"
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="interview_date"
                control={startForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="interview-date">
                      Interview Date
                    </FieldLabel>
                    <Input
                      {...field}
                      id="interview-date"
                      type="datetime-local"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="kit_id"
                control={startForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="interview-kit">Question Kit</FieldLabel>
                    <SelectField
                      {...field}
                      id="interview-kit"
                      aria-invalid={fieldState.invalid}
                    >
                      <option value="">Select a kit</option>
                      {availableKits.map((kit: Kit) => (
                        <option key={kit.id} value={kit.id}>
                          {kit.title}
                        </option>
                      ))}
                    </SelectField>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            {selectedKit && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium">{selectedKit.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedKit.description}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {selectedQuestions.map((question: KitQuestion) => (
                    <div
                      key={question.id}
                      className="flex flex-col gap-1 rounded-md bg-background p-3 text-sm sm:flex-row sm:items-start sm:justify-between"
                    >
                      <span>
                        {question.order_index}. {question.text}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {secondsToMinutes(question.default_time_seconds)} min
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end">
        <Button type="submit" form="interview-start-form">
          <Play />
          Start Interview
        </Button>
      </CardFooter>
    </Card>
  )
}
