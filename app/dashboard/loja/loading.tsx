// Shown instantly while the page's data loads, so navigating inside the
// dashboard never looks frozen (the database lives a region away from the
// Worker, so a few hundred ms of waiting is normal).
export default function LojaLoading() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
          <div className="h-10 w-2/3 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
        </div>
      ))}
    </div>
  );
}
