import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getOwnedStore } from "@/lib/stores";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { NavLink } from "@/components/dashboard/NavLink";
import { ToastHost } from "@/components/dashboard/ToastHost";

// Shared shell (logo, nav, "ver loja", sair) for every signed-in screen:
// the home at /dashboard and everything under /dashboard/loja/**. Login and
// signup live outside this route group, so they don't get the shell (and
// don't hit the requireUser() below, which would bounce them right back to
// login).
//
// /dashboard/loja/nova renders here too, before there's any store — the nav
// pills stay hidden until one exists.
//
// Deliberately the same cached lookup the pages inside use, so the shell and
// the page it wraps share one database round trip instead of each doing
// their own.
export default async function DashboardShellLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const store = await getOwnedStore();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 pt-3">
          <Link href="/dashboard" className="text-lg font-bold tracking-tight text-violet-600 dark:text-violet-400">
            Flip
          </Link>

          <div className="flex items-center gap-3">
            {store ? (
              <Link
                href={`/${store.slug}`}
                target="_blank"
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {store.status === "published" ? "Ver loja ↗" : "Ver prévia ↗"}
              </Link>
            ) : null}
            <LogoutButton />
          </div>
        </div>

        {store ? (
          <div className="mx-auto w-full max-w-4xl px-6 pb-3 pt-2">
            <nav className="flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
              <NavLink href="/dashboard">Início</NavLink>
              <NavLink href={store.businessType === "catalog" ? "/dashboard/loja/produtos" : "/dashboard/loja/conteudo"}>
                {store.businessType === "catalog" ? "Produtos" : "Conteúdo"}
              </NavLink>
              <NavLink href="/dashboard/loja">Loja</NavLink>
            </nav>
          </div>
        ) : null}
      </header>

      <div className="flex flex-1 flex-col">{children}</div>
      <ToastHost />
    </div>
  );
}
