export default function CatalogoLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-6 py-10">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-52 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="h-28 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="h-14 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}
