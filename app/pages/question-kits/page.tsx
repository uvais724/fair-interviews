import { getQuestionKits } from "@/app/actions/getQuestions";
import KitList from "@/components/kits/KitList";

export default async function page() {
    const questionKits = await getQuestionKits();

    return <KitList questionKits={questionKits} />;
}