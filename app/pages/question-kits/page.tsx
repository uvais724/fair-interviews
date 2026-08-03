import { getQuestionKits } from "@/app/actions/getQuestions";
import KitList from "@/components/kits/KitList";

export default async function page() {

    const questionKits = await getQuestionKits();
    console.log("questionKits", questionKits);

    return (
        <KitList questionKits={questionKits} />
    )
}