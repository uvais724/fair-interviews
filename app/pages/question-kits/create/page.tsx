import { KitForm } from '@/components/kits/KitForm'
import prisma from '@/lib/prisma';

export async function createQuestionKit(data: FormData) {
    'use server'

    const title = data.get('title')?.toString() ?? ''
    const description = data.get('description')?.toString() ?? ''
    const rawQuestions = data.get('questions')?.toString() ?? '[]'

    const questions = JSON.parse(rawQuestions) as Array<{
        text: string
        default_time_seconds: number
        tag: string
    }>

    console.log('Creating question kit with data:', {
        title,
        description,
        questions,
    })

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
                create: questions.map((question, index) => ({
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
