"use client"

import { Pencil, Save, Trash2, X } from "lucide-react"
import { useActionState, useState } from "react"

import { Button } from "@/components/ui/button"
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

export type QuestionActionState = {
  success: boolean
  message?: string
  errors?: {
    text?: string[]
    tag?: string[]
    default_time_seconds?: string[]
    form?: string[]
  }
}

type KitQuestionEditorProps = {
  question: {
    id: string
    text: string
    tag?: string | null
    defaultTimeSeconds: number
    orderIndex: number
  }
  canDelete: boolean
  updateQuestionAction: (
    state: QuestionActionState,
    formData: FormData
  ) => Promise<QuestionActionState>
  deleteQuestionAction: (
    state: QuestionActionState,
    formData: FormData
  ) => Promise<QuestionActionState>
}

const initialState: QuestionActionState = {
  success: false,
}

function fieldErrors(errors?: string[]) {
  return errors?.map((message) => ({ message }))
}

export function KitQuestionEditor({
  question,
  canDelete,
  updateQuestionAction,
  deleteQuestionAction,
}: KitQuestionEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [updateState, updateFormAction, isUpdating] = useActionState(
    updateQuestionAction,
    initialState
  )
  const [deleteState, deleteFormAction, isDeleting] = useActionState(
    deleteQuestionAction,
    initialState
  )

  if (!isEditing) {
    return (
      <li className="rounded border p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-sm font-medium text-gray-500">
              Question {question.orderIndex}
            </span>
            <p className="wrap-break-word">{question.text}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:items-end">
            <div className="flex flex-col gap-1 text-sm text-gray-600 sm:items-end">
              {question.tag && <span>{question.tag}</span>}
              <span>{question.defaultTimeSeconds} seconds</span>
            </div>
            <div className="flex gap-2">
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
              <form action={deleteFormAction}>
                <input type="hidden" name="question_id" value={question.id} />
                <Button
                  type="submit"
                  variant="destructive"
                  size="icon-sm"
                  aria-label={`Delete question ${question.orderIndex}`}
                  title={`Delete question ${question.orderIndex}`}
                  disabled={!canDelete || isDeleting}
                >
                  <Trash2 />
                </Button>
              </form>
            </div>
            {deleteState.errors?.form && (
              <FieldError errors={fieldErrors(deleteState.errors.form)} />
            )}
          </div>
        </div>
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
        <FieldGroup className="gap-4">
          <Field data-invalid={!!updateState.errors?.text}>
            <FieldLabel htmlFor={`question-${question.id}-text`}>
              Question Text
            </FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                id={`question-${question.id}-text`}
                name="text"
                defaultValue={question.text}
                rows={3}
                className="min-h-20 resize-none"
                aria-invalid={!!updateState.errors?.text}
                required
              />
              <InputGroupAddon align="block-end">
                <InputGroupText>240 characters max</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={fieldErrors(updateState.errors?.text)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!updateState.errors?.tag}>
              <FieldLabel htmlFor={`question-${question.id}-tag`}>Tag</FieldLabel>
              <Input
                id={`question-${question.id}-tag`}
                name="tag"
                defaultValue={question.tag ?? ""}
                autoComplete="off"
                aria-invalid={!!updateState.errors?.tag}
                required
              />
              <FieldError errors={fieldErrors(updateState.errors?.tag)} />
            </Field>
            <Field data-invalid={!!updateState.errors?.default_time_seconds}>
              <FieldLabel htmlFor={`question-${question.id}-time`}>
                Default Time
              </FieldLabel>
              <InputGroup>
                <Input
                  id={`question-${question.id}-time`}
                  name="default_time_seconds"
                  type="number"
                  min={60}
                  max={7200}
                  step={60}
                  defaultValue={question.defaultTimeSeconds}
                  aria-invalid={!!updateState.errors?.default_time_seconds}
                  required
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>seconds</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription>
                Use values like 600 or 900 seconds.
              </FieldDescription>
              <FieldError
                errors={fieldErrors(updateState.errors?.default_time_seconds)}
              />
            </Field>
          </div>
          {updateState.errors?.form && (
            <FieldError errors={fieldErrors(updateState.errors.form)} />
          )}
          {updateState.success && updateState.message && (
            <p className="text-sm text-muted-foreground">
              {updateState.message}
            </p>
          )}
        </FieldGroup>
      </form>
    </li>
  )
}
