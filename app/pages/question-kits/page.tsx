import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getQuestionKits } from "@/app/actions/getQuestions";
import KitList from "@/components/kits/KitList";

export default async function Page() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const questionKits = await getQuestionKits();

  return <KitList questionKits={questionKits} />;
}