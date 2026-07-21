"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Play, RotateCcw, Send } from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"
import * as z from "zod"

import kits from "@/mocks/question-kits.json"
import questions from "@/mocks/questions.json"
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

type Kit = (typeof kits)[number]
type KitQuestion = (typeof questions)[number]

const startSchema = z.object({
  candidate_name: z
    .string()
    .trim()
    .min(2, "Candidate name must be at least 2 characters.")
    .max(80, "Candidate name must be at most 80 characters."),
  candidate_title: z
    .string()
    .trim()
    .min(2, "Candidate title must be at least 2 characters.")
    .max(80, "Candidate title must be at most 80 characters."),
  interview_date: z.string().min(1, "Choose the interview date and time."),
  kit_id: z.string().min(1, "Choose a question kit."),
})

const captureSchema = z.object({
  questions: z
    .array(
      z.object({
        question_id: z.string(),
        question_text: z.string(),
        order_index: z.number(),
        allocated_time_seconds: z.number(),
        actual_time_seconds: z.coerce
          .number<number>()
          .int("Actual time must be a whole number of seconds.")
          .min(0, "Actual time cannot be negative.")
          .max(7200, "Actual time must be at most 7200 seconds."),
        rating: z.coerce
          .number<number>()
          .int("Rating must be a whole number.")
          .min(1, "Rating must be at least 1.")
          .max(5, "Rating must be at most 5."),
        notes: z
          .string()
          .trim()
          .max(500, "Notes must be at most 500 characters."),
      })
    )
    .min(1, "The selected kit needs at least one question."),
  overall_rating: z.coerce
    .number<number>()
    .int("Overall rating must be a whole number.")
    .min(1, "Overall rating must be at least 1.")
    .max(5, "Overall rating must be at most 5."),
  overall_verdict: z.enum(["select", "hold", "reject"], {
    error: "Choose an overall verdict.",
  }),
  overall_comments: z
    .string()
    .trim()
    .min(10, "Overall feedback must be at least 10 characters.")
    .max(1000, "Overall feedback must be at most 1000 characters."),
})

type StartFormValues = z.infer<typeof startSchema>
type CaptureFormValues = z.infer<typeof captureSchema>

const verdicts = [
  { value: "select", label: "Select" },
  { value: "hold", label: "Hold" },
  { value: "reject", label: "Reject" },
] as const

function getLocalDateTimeValue() {
  const now = new Date()
  const offsetMs = now.getTimezoneOffset() * 60 * 1000

  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16)
}

function getKitQuestions(kitId: string) {
  return questions
    .filter((question) => question.kit_id === kitId)
    .sort((first, second) => first.order_index - second.order_index)
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

export function InterviewCapture() {
  const [startedInterview, setStartedInterview] =
    React.useState<StartFormValues | null>(null)

  const startForm = useForm<StartFormValues>({
    resolver: zodResolver(startSchema),
    defaultValues: {
      candidate_name: "",
      candidate_title: "",
      interview_date: getLocalDateTimeValue(),
      kit_id: "",
    },
  })

  const captureForm = useForm<CaptureFormValues>({
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
  const selectedKit = kits.find((kit) => kit.id === selectedKitId)
  const selectedQuestions = getKitQuestions(selectedKitId)

  function startInterview(data: StartFormValues) {
    const kitQuestions = getKitQuestions(data.kit_id)

    captureForm.reset({
      questions: kitQuestions.map((question) => ({
        question_id: question.id,
        question_text: question.text,
        order_index: question.order_index,
        allocated_time_seconds: question.default_time_seconds,
        actual_time_seconds: question.default_time_seconds,
        rating: 3,
        notes: "",
      })),
      overall_rating: 3,
      overall_verdict: "hold",
      overall_comments: "",
    })
    setStartedInterview(data)
  }

  function resetInterview() {
    setStartedInterview(null)
    captureForm.reset()
  }

  function submitInterview(data: CaptureFormValues) {
    if (!startedInterview) {
      return
    }

    const now = new Date().toISOString()
    const idStamp = now.replace(/\D/g, "")
    const interviewId = `int_${idStamp}`
    const selectedKit = kits.find((kit) => kit.id === startedInterview.kit_id)
    const payload = {
      interview: {
        id: interviewId,
        user_id: "usr_1",
        candidate_name: startedInterview.candidate_name,
        candidate_role: startedInterview.candidate_title,
        kit_id: startedInterview.kit_id,
        kit_title: selectedKit?.title ?? null,
        status: "completed",
        overall_rating: data.overall_rating,
        overall_verdict: data.overall_verdict,
        overall_comments: data.overall_comments,
        interview_date: new Date(startedInterview.interview_date).toISOString(),
        created_at: now,
        updated_at: now,
      },
      questions: data.questions.map((question, index) => ({
        id: `iq_${idStamp}_${index + 1}`,
        interview_id: interviewId,
        question_id: question.question_id,
        question_text: question.question_text,
        order_index: question.order_index,
        allocated_time_seconds: question.allocated_time_seconds,
        actual_time_seconds: question.actual_time_seconds,
        rating: question.rating,
        notes: question.notes,
        created_at: now,
      })),
    }

    console.log("Interview Captured:", payload)
  }

  if (startedInterview) {
    const activeKit = kits.find((kit) => kit.id === startedInterview.kit_id)

    return (
      <Card className="w-full sm:max-w-5xl">
        <CardHeader>
          <CardTitle>Capture Interview</CardTitle>
          <CardDescription>
            {startedInterview.candidate_name} for{" "}
            {startedInterview.candidate_title}
            {activeKit ? ` using ${activeKit.title}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="interview-capture-form"
            onSubmit={captureForm.handleSubmit(submitInterview)}
          >
            <FieldGroup>
              {questionFields.map((question, index) => (
                <div key={question.question_id} className="rounded-lg border p-4">
                  <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Question {question.order_index}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {question.question_text}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {question.allocated_time_seconds}s allocated
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
                    <Controller
                      name={`questions.${index}.actual_time_seconds`}
                      control={captureForm.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor={`interview-question-${index}-time`}
                          >
                            Actual Time
                          </FieldLabel>
                          <InputGroup>
                            <Input
                              {...field}
                              id={`interview-question-${index}-time`}
                              type="number"
                              min={0}
                              max={7200}
                              step={30}
                              aria-invalid={fieldState.invalid}
                              onChange={(event) =>
                                field.onChange(event.target.value)
                              }
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupText>seconds</InputGroupText>
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
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor={`interview-question-${index}-rating`}
                          >
                            Rating
                          </FieldLabel>
                          <Input
                            {...field}
                            id={`interview-question-${index}-rating`}
                            type="number"
                            min={1}
                            max={5}
                            step={1}
                            aria-invalid={fieldState.invalid}
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                          />
                          <FieldDescription>Use a 1 to 5 score.</FieldDescription>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
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
              ))}

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
                          <Input
                            {...field}
                            id="interview-overall-rating"
                            type="number"
                            min={1}
                            max={5}
                            step={1}
                            aria-invalid={fieldState.invalid}
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                          />
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
          <Button type="submit" form="interview-capture-form">
            <Send />
            Log Interview
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full sm:max-w-3xl">
      <CardHeader>
        <CardTitle>Start Interview</CardTitle>
        <CardDescription>
          Add candidate details and choose the question kit for this session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="interview-start-form"
          onSubmit={startForm.handleSubmit(startInterview)}
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
                name="candidate_title"
                control={startForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="interview-candidate-title">
                      Candidate Title
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
                      {kits.map((kit: Kit) => (
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
                        {question.default_time_seconds}s
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
