import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Check,
  ClipboardList,
  FileSpreadsheet,
  Layers3,
  Smartphone,
  Star,
  Timer,
  UsersRound,
} from "lucide-react"

const features = [
  { icon: Layers3, title: "Reusable question kits", description: "Create role-specific kits with ordered questions, tags, and a default time for each prompt." },
  { icon: Timer, title: "Guided interview sessions", description: "Track time per question, record actual duration, and keep notes beside each answer." },
  { icon: Star, title: "Consistent evaluations", description: "Rate answers and the overall interview, then record a Select, Hold, or Reject verdict." },
  { icon: ClipboardList, title: "Candidate interview records", description: "Keep candidate name, role, interview date, feedback, and question-level results together." },
  { icon: BarChart3, title: "A clear hiring overview", description: "Review recent interviews, completion progress, pipeline activity, and question kit coverage." },
  { icon: FileSpreadsheet, title: "Excel exports", description: "Download interview details and feedback in a spreadsheet for sharing or record keeping." },
]

const steps = [
  { number: "01", title: "Prepare your kit", description: "Build a repeatable question set for a role or interview stage." },
  { number: "02", title: "Run the interview", description: "Capture answers, timing, notes, ratings, and your overall verdict." },
  { number: "03", title: "Review and share", description: "Return to the interview record or export it when you need it." },
]

export function LandingPage() {
  return (
    <main>
      <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/75 px-3 py-1.5 text-xs font-semibold tracking-wide text-cyan-800 shadow-sm">
            <span className="size-2 rounded-full bg-cyan-500" />
            A calmer way to run structured interviews
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Better interviews start with a <span className="text-cyan-700">clear process.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Prepare consistent question kits, capture thoughtful feedback, and keep every candidate evaluation easy to review.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(14,116,144,0.22)] transition hover:-translate-y-0.5 hover:bg-cyan-800">
              Get started <ArrowRight className="size-4" />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-xl border border-cyan-200 bg-white/80 px-5 py-3 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50">
              Log in
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
            {["Reusable kits", "Question-level notes", "Exportable records"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5"><Check className="size-4 text-cyan-700" /> {item}</span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-5 rounded-[2rem] bg-linear-to-br from-cyan-300/40 via-sky-200/30 to-indigo-200/40 blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 shadow-[0_28px_80px_rgba(14,116,144,0.16)] backdrop-blur sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Interview workspace</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Structured from start to finish</h2>
              </div>
              <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><UsersRound className="size-5" /></div>
            </div>
            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-sm font-semibold text-slate-900">Interview plan</p><p className="mt-1 text-xs text-slate-500">Senior Engineer · 4 questions</p></div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">Ready</span>
              </div>
              <div className="mt-4 space-y-2.5">
                {["Technical depth", "Problem solving", "Collaboration"].map((label, index) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 shadow-sm">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-xs font-semibold text-cyan-800">0{index + 1}</span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-slate-700">{label}</span>
                    <span className="text-xs text-slate-500">10 min</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-cyan-50/80 p-4"><Timer className="size-4 text-cyan-800" /><p className="mt-3 text-sm font-semibold text-slate-900">Stay on track</p><p className="mt-1 text-xs leading-5 text-slate-600">Question timers and actual duration</p></div>
              <div className="rounded-2xl bg-indigo-50/80 p-4"><Star className="size-4 text-indigo-700" /><p className="mt-3 text-sm font-semibold text-slate-900">Capture feedback</p><p className="mt-1 text-xs leading-5 text-slate-600">Ratings, notes, and a final verdict</p></div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-cyan-200 px-3 py-2.5 text-xs text-slate-600"><Smartphone className="size-4 text-cyan-700" /> Open interview capture on mobile with a QR code</div>
          </div>
        </div>
      </section>

      <section className="border-y border-cyan-100/80 bg-white/55 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Everything in one workflow</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">From interview plan to useful feedback</h2>
            <p className="mt-4 leading-7 text-slate-600">Keep your questions, candidate notes, and decisions connected in one place.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-2xl border border-cyan-100/80 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="inline-flex rounded-xl bg-cyan-50 p-3 text-cyan-800"><Icon className="size-5" /></div>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">A simple rhythm for every interview</h2>
            <p className="mt-4 leading-7 text-slate-600">Make the process repeatable for your team while leaving room for real conversation.</p>
          </div>
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4 rounded-2xl border border-cyan-100/80 bg-white/75 p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-700 text-sm font-semibold text-white">{step.number}</span>
                <div><h3 className="font-semibold text-slate-900">{step.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-4 mb-14 rounded-3xl bg-linear-to-r from-cyan-800 to-sky-700 px-6 py-12 text-center text-white shadow-[0_24px_60px_rgba(14,116,144,0.22)] sm:mx-6 sm:px-10 sm:py-14 lg:mx-auto lg:mb-20 lg:max-w-6xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Make your next interview easier to run and review.</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-cyan-50">Start with a question kit, capture the conversation, and keep the decision grounded in clear feedback.</p>
        <Link href="/signup" className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-cyan-900 transition hover:-translate-y-0.5 hover:bg-cyan-50">Create your account <ArrowRight className="size-4" /></Link>
      </section>
    </main>
  )
}
