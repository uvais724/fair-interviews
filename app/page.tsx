import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-2 p-4">

      <Link
        href="pages/question-kits"
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Question Kits
      </Link>
      <Link
        href="pages/interviews"
        className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      >
        Interviews
      </Link>
    </div>
  );
}
