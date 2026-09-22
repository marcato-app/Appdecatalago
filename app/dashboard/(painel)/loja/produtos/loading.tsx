export default function ProdutosLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-36 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
