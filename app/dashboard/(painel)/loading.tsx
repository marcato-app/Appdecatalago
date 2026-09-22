export default function DashboardHomeLoading() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-44 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="h-28 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex gap-2">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-16 flex-1 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
