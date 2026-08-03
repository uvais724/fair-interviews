import { KitForm } from '@/components/kits/KitForm'
import prisma from '@/lib/prisma';
import { kitInputSchema } from '@/lib/question-kit-validation';

export async function createQuestionKit(data: FormData) {
    'use server'

    const rawQuestions = data.get('questions')?.toString() ?? '[]'
    let questions: unknown

    try {
        questions = JSON.parse(rawQuestions)
    } catch {
        throw new Error('Questions must be valid JSON.')
    }

    const validatedFields = kitInputSchema.safeParse({
        title: data.get('title')?.toString() ?? '',
        description: data.get('description')?.toString() ?? '',
        questions,
    })

    if (!validatedFields.success) {
        throw new Error('Question kit data is invalid.')
    }

    const { title, description, questions: validatedQuestions } = validatedFields.data

    const user = await prisma.user.findFirst()

    if (!user) {
        throw new Error('No user found in the database. Create a user first.')
    }

    await prisma.questionKit.create({
        data: {
            userId: user.id,
            title,
            description: description || null,
            questions: {
                create: validatedQuestions.map((question, index) => ({
                    text: question.text,
                    orderIndex: index + 1,
                    defaultTimeSeconds: question.default_time_seconds,
                    tag: question.tag,
                })),
            },
        },
    })
}

export default function page() {
    return <KitForm action={createQuestionKit} />
}
