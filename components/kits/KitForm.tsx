"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"

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
import { useTransition } from "react"
import { kitInputSchema } from "@/lib/question-kit-validation"

type KitFormProps = {
  action: (formData: FormData) => Promise<void>
}

export function KitForm({ action }: KitFormProps) {
  const [isPending, startTransition] = useTransition()
  
  const form = useForm<z.infer<typeof kitInputSchema>>({
    resolver: zodResolver(kitInputSchema),
    defaultValues: {
      title: "",
      description: "",
      questions: [
        {
          text: "",
          default_time_seconds: 600,
          tag: "",
        },
      ],
    },
  })

  const questions = useFieldArray({
    control: form.control,
    name: "questions",
  })

  function onSubmit(data: z.infer<typeof kitInputSchema>) {
    const formData = new FormData()

    formData.set("title", data.title)
    formData.set("description", data.description)
    formData.set("questions", JSON.stringify(data.questions))

    startTransition(() => {
      void action(formData)
    })

    form.reset();
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full sm:max-w-3xl">
        <CardHeader>
          <CardTitle>Create Question Kit</CardTitle>
          <CardDescription>
            Build a reusable interview kit with ordered questions, tags, and
            default answer times.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="question-kit-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="question-kit-title">
                      Kit Title
                    </FieldLabel>
                    <Input
                      {...field}
                      id="question-kit-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="Java Backend Interview"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="question-kit-description">
                      Description
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="question-kit-description"
                        placeholder="Core Java, Spring Boot and SQL interview questions."
                        rows={6}
                        className="min-h-24 resize-none"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.value.length}/240 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      Keep this short enough to identify the kit in lists.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field data-invalid={!!form.formState.errors.questions?.message}>
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel>Questions</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      questions.append({
                        text: "",
                        default_time_seconds: 600,
                        tag: "",
                      })
                    }
                  >
                    <Plus />
                    Add Question
                  </Button>
                </div>
                {form.formState.errors.questions?.message && (
                  <FieldError
                    errors={[form.formState.errors.questions]}
                  />
                )}
                <div className="flex flex-col gap-4">
                  {questions.fields.map((question, index) => (
                    <div
                      key={question.id}
                      className="rounded-lg border bg-card p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-medium">
                          Question {index + 1}
                        </h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remove question ${index + 1}`}
                          title={`Remove question ${index + 1}`}
                          disabled={questions.fields.length === 1}
                          onClick={() => questions.remove(index)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      <FieldGroup className="gap-4">
                        <Controller
                          name={`questions.${index}.text`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel
                                htmlFor={`question-kit-question-${index}-text`}
                              >
                                Question Text
                              </FieldLabel>
                              <InputGroup>
                                <InputGroupTextarea
                                  {...field}
                                  id={`question-kit-question-${index}-text`}
                                  placeholder="Explain HashMap internals."
                                  rows={3}
                                  className="min-h-20 resize-none"
                                  aria-invalid={fieldState.invalid}
                                />
                                <InputGroupAddon align="block-end">
                                  <InputGroupText className="tabular-nums">
                                    {field.value.length}/240 characters
                                  </InputGroupText>
                                </InputGroupAddon>
                              </InputGroup>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Controller
                            name={`questions.${index}.tag`}
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                  htmlFor={`question-kit-question-${index}-tag`}
                                >
                                  Tag
                                </FieldLabel>
                                <Input
                                  {...field}
                                  id={`question-kit-question-${index}-tag`}
                                  aria-invalid={fieldState.invalid}
                                  placeholder="Core Java"
                                  autoComplete="off"
                                />
                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                            )}
                          />
                          <Controller
                            name={`questions.${index}.default_time_seconds`}
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                  htmlFor={`question-kit-question-${index}-time`}
                                >
                                  Default Time
                                </FieldLabel>
                                <InputGroup>
                                  <Input
                                    {...field}
                                    id={`question-kit-question-${index}-time`}
                                    type="number"
                                    min={60}
                                    max={7200}
                                    step={60}
                                    aria-invalid={fieldState.invalid}
                                    onChange={(event) =>
                                      field.onChange(event.target.value)
                                    }
                                  />
                                  <InputGroupAddon align="inline-end">
                                    <InputGroupText>seconds</InputGroupText>
                                  </InputGroupAddon>
                                </InputGroup>
                                <FieldDescription>
                                  Use values like 600 or 900 seconds.
                                </FieldDescription>
                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                            )}
                          />
                        </div>
                      </FieldGroup>
                    </div>
                  ))}
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit" form="question-kit-form" disabled={isPending}>
              {isPending ? "Creating..." : "Create Kit"}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  )
}
