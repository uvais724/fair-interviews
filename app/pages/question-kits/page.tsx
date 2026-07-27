import KitList from "@/components/kits/KitList";
import prisma from "@/lib/prisma";

async function getQuestionKits() {
    const questionKits = await prisma.questionKit.findMany({
        include: {
            questions: true,
        },
    });

    return questionKits;
}

export default async function page() {

    const questionKits = await getQuestionKits();
    console.log("questionKits", questionKits);

    return (
        <KitList questionKits={questionKits} />
    )
}