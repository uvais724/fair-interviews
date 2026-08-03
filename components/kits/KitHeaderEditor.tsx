"use client"

import { Pencil, Save, Trash2, X } from "lucide-react"
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

export type KitActionState = {
  success: boolean
  message?: string
  errors?: {
    title?: string[]
    description?: string[]
    form?: string[]
  }
}

type KitHeaderEditorProps = {
  questionKit: {
    id: string
    title: string
    description?: string | null
    createdAt: Date
    questions: {
      id: string
    }[]
  }
  updateKitAction: (
    state: KitActionState,
    formData: FormData
  ) => Promise<KitActionState>
  deleteKitAction: (
    state: KitActionState,
    formData: FormData
  ) => Promise<KitActionState>
}

const initialState: KitActionState = {
  success: false,
}

function fieldErrors(errors?: string[]) {
  return errors?.map((message) => ({ message }))
}

export function KitHeaderEditor({
  questionKit,
  updateKitAction,
  deleteKitAction,
}: KitHeaderEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [updateState, updateFormAction, isUpdating] = useActionState(
    async (state: KitActionState, formData: FormData) => {
      const nextState = await updateKitAction(state, formData)

      if (nextState.success) {
        setIsEditing(false)
      }

      return nextState
    },
    initialState
  )
  const [deleteState, deleteFormAction, isDeleting] = useActionState(
    deleteKitAction,
    initialState
  )

  if (isEditing) {
    return (
      <section className="flex flex-col gap-4 rounded border p-4">
        <form action={updateFormAction} className="flex flex-col gap-4">
          <input type="hidden" name="kit_id" value={questionKit.id} />
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold">Edit Question Kit</h1>
              <p className="text-sm text-muted-foreground">
                Update the kit details shown in lists and interviews.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Cancel kit editing"
                title="Cancel kit editing"
                onClick={() => setIsEditing(false)}
                disabled={isUpdating}
              >
                <X />
              </Button>
              <Button
                type="submit"
                size="icon-sm"
                aria-label="Save kit"
                title="Save kit"
                disabled={isUpdating}
              >
                <Save />
              </Button>
            </div>
          </div>
          <FieldGroup className="gap-4">
            <Field data-invalid={!!updateState.errors?.title}>
              <FieldLabel htmlFor="question-kit-edit-title">Kit Title</FieldLabel>
              <Input
                id="question-kit-edit-title"
                name="title"
                defaultValue={questionKit.title}
                autoComplete="off"
                aria-invalid={!!updateState.errors?.title}
                required
              />
              <FieldError errors={fieldErrors(updateState.errors?.title)} />
            </Field>
            <Field data-invalid={!!updateState.errors?.description}>
              <FieldLabel htmlFor="question-kit-edit-description">
                Description
              </FieldLabel>
              <InputGroup>
                <InputGroupTextarea
                  id="question-kit-edit-description"
                  name="description"
                  defaultValue={questionKit.description ?? ""}
                  rows={5}
                  className="min-h-24 resize-none"
                  aria-invalid={!!updateState.errors?.description}
                  required
                />
                <InputGroupAddon align="block-end">
                  <InputGroupText>240 characters max</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldError
                errors={fieldErrors(updateState.errors?.description)}
              />
            </Field>
            {updateState.errors?.form && (
              <FieldError errors={fieldErrors(updateState.errors.form)} />
            )}
          </FieldGroup>
        </form>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4 rounded border p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="wrap-break-word text-2xl font-bold">{questionKit.title}</h1>
          <p className="wrap-break-word text-gray-600">
            {questionKit.description ?? "No description"}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Edit question kit"
            title="Edit question kit"
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
              aria-label="Delete question kit"
              title="Delete question kit"
            >
              <Trash2 />
            </AlertDialogTrigger>
            <AlertDialogPortal>
              <AlertDialogBackdrop />
              <AlertDialogPopup>
                <div className="flex flex-col gap-2">
                  <AlertDialogTitle>Delete question kit?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &quot;{questionKit.title}&quot;
                    and all of its questions. This action cannot be undone.
                  </AlertDialogDescription>
                </div>
                <form action={deleteFormAction} className="flex justify-end gap-2">
                  <input type="hidden" name="kit_id" value={questionKit.id} />
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
                    {isDeleting ? "Deleting..." : "Delete Kit"}
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
      <div className="flex gap-4 text-sm text-gray-600">
        <span>{questionKit.questions.length} questions</span>
        <span>Created {questionKit.createdAt.toLocaleDateString()}</span>
      </div>
      {updateState.success && updateState.message && (
        <p className="text-sm text-muted-foreground">{updateState.message}</p>
      )}
    </section>
  )
}
