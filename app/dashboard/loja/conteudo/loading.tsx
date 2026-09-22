export default function ConteudoLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="h-5 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-9 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
          <div className="h-9 w-3/4 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
        </div>
      ))}
    </div>
  );
}
