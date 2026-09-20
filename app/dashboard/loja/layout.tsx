import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getStoreByOwnerId } from "@/lib/stores";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { NavLink } from "@/components/dashboard/NavLink";
import { ToastHost } from "@/components/dashboard/ToastHost";

// Shared shell (logo, loja/produtos nav, "ver loja", sair) for every screen
// under /dashboard/loja/** — including /nova, where there's no store yet,
// so the nav pills are hidden until getStoreByOwnerId finds one.
export default async function DashboardShellLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const store = await getStoreByOwnerId(user.id);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/dashboard/loja" className="text-lg font-bold tracking-tight text-violet-600 dark:text-violet-400">
            Flip
          </Link>

          {store ? (
            <nav className="hidden items-center gap-1 rounded-full border border-zinc-200 bg-zinc-100 p-1 sm:flex dark:border-zinc-800 dark:bg-zinc-900">
              <NavLink href="/dashboard/loja">Loja</NavLink>
              <NavLink href={store.businessType === "catalog" ? "/dashboard/loja/produtos" : "/dashboard/loja/conteudo"}>
                {store.businessType === "catalog" ? "Produtos" : "Conteúdo"}
              </NavLink>
            </nav>
          ) : null}

          <div className="flex items-center gap-3">
            {store?.status === "published" ? (
              <Link
                href={`/${store.slug}`}
                target="_blank"
                className="hidden text-sm font-medium text-zinc-500 hover:text-zinc-900 sm:block dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Ver loja ↗
              </Link>
            ) : null}
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col">{children}</div>
      <ToastHost />
    </div>
  );
}
