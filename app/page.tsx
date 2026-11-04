export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-xl border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Fair Interviews</h1>
        <p className="mt-3 text-muted-foreground">
          Manage question kits and interview evaluations from the navigation above.
        </p>
      </div>
    </main>
  );
}
