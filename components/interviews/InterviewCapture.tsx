"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Play, RotateCcw, Send } from "lucide-react"
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
})

type StartFormValues = z.infer<typeof startSchema>
type CaptureFormValues = z.infer<typeof captureSchema>

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
  const selectedKit = availableKits.find((kit) => kit.id === selectedKitId)
  const selectedQuestions = getKitQuestions(selectedKitId ?? "", availableQuestions)

  function startInterview(data: StartFormValues) {
    const kitQuestions = getKitQuestions(data.kit_id, availableQuestions)

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
