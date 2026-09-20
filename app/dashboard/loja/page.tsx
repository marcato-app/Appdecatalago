import Link from "next/link";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db/client";
import { storeLinks } from "@/db/schema";
import { requireOwnedStore } from "@/lib/stores";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { StoreEditForm } from "@/components/dashboard/StoreEditForm";
import { StoreLinksManager } from "@/components/dashboard/StoreLinksManager";
import { togglePublishAction } from "./actions";

export default async function LojaPage() {
  const store = await requireOwnedStore();
  const isPublished = store.status === "published";
  const links = await db
    .select()
    .from(storeLinks)
    .where(eq(storeLinks.storeId, store.id))
    .orderBy(asc(storeLinks.sortOrder));

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sua loja</h1>
        <LogoutButton />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-zinc-500">Status</p>
            <p className="font-medium">{isPublished ? "Publicada" : "Rascunho"}</p>
          </div>
          <form action={togglePublishAction}>
            <button
              type="submit"
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              {isPublished ? "Despublicar" : "Publicar"}
            </button>
          </form>
        </div>

        <div>
          <p className="text-sm text-zinc-500">Link público</p>
          {isPublished ? (
            <Link href={`/${store.slug}`} className="font-medium underline" target="_blank">
              /{store.slug}
            </Link>
          ) : (
            <p className="font-medium text-zinc-400">
              /{store.slug} <span className="text-xs">(publique pra ativar)</span>
            </p>
          )}
        </div>

        <Link href="/dashboard/loja/produtos" className="text-sm font-medium underline">
          Gerenciar produtos →
        </Link>
      </div>

      <StoreEditForm store={store} />

      <StoreLinksManager links={links} />
    </div>
  );
}
