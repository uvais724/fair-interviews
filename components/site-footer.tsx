import Link from "next/link";

const guides = [
  { href: "/guides/types-of-interviews", label: "Types of Interviews" },
  {
    href: "/guides/structured-vs-unstructured-interviews",
    label: "Structured vs. Unstructured Interviews",
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-cyan-200/80 bg-white/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <nav aria-label="Interview guides" className="flex flex-col gap-2 text-sm sm:flex-row sm:gap-5">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="text-cyan-800 underline-offset-4 hover:underline"
            >
              {guide.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Fair Interviews</p>
      </div>
    </footer>
  );
}
