import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-2 p-4">
      <Button variant="link">
        <Link
          href="pages/question-kits"
        >
          Question Kits
        </Link>
      </Button>
      
      <Button variant="link">
        <Link
          href="pages/interviews"
        >
          Interviews
        </Link>
      </Button>
    </div>
  );
}
