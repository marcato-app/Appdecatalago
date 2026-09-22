import Link from "next/link";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db/client";
import { storeLinks } from "@/db/schema";
import { requireOwnedStoreWithTemplate } from "@/lib/stores";
import { getTemplateManifest } from "@/templates/registry";
import { resolveStorefrontSettings } from "@/lib/storefront-settings";
import { StoreEditForm } from "@/components/dashboard/StoreEditForm";
import { StoreLinksManager } from "@/components/dashboard/StoreLinksManager";
import { StorefrontSettingsForm } from "@/components/dashboard/StorefrontSettingsForm";
import { StoreTemplateForm } from "@/components/dashboard/StoreTemplateForm";
import { togglePublishAction } from "./actions";

export default async function LojaPage() {
  const { store, templateSlug } = await requireOwnedStoreWithTemplate();
  const isPublished = store.status === "published";
  const links = await db
    .select()
    .from(storeLinks)
    .where(eq(storeLinks.storeId, store.id))
    .orderBy(asc(storeLinks.sortOrder));
  const isIphoneStore = templateSlug ? getTemplateManifest(templateSlug)?.slug === "iphone-store" : false;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sua loja</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{store.name}</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${isPublished ? "bg-emerald-500" : "bg-amber-500"}`}
              aria-hidden="true"
            />
            <span className="text-sm font-medium">{isPublished ? "Publicada" : "Rascunho"}</span>
          </div>
          <form action={togglePublishAction}>
            <button
              type="submit"
              className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              {isPublished ? "Despublicar" : "Publicar"}
            </button>
          </form>
        </div>

        {!isPublished ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            Sua loja ainda está em rascunho — só você consegue abrir o link. Clique em{" "}
            <strong className="font-semibold">Publicar</strong> quando quiser deixá-la no ar pros clientes.
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-950">
          <div className="min-w-0">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isPublished ? "Link público" : "Link (prévia só pra você)"}
            </p>
            <Link
              href={`/${store.slug}`}
              target="_blank"
              className="truncate font-medium text-violet-600 hover:underline dark:text-violet-400"
            >
              /{store.slug}
            </Link>
          </div>
        </div>

        {store.businessType === "catalog" ? (
          <Link
            href="/dashboard/loja/produtos"
            className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
          >
            Gerenciar produtos <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <Link
            href="/dashboard/loja/conteudo"
            className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
          >
            Gerenciar conteúdo <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Modelo</h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Define o visual da sua vitrine e o que você gerencia no painel. Pode trocar quando quiser.
        </p>
        <StoreTemplateForm currentSlug={templateSlug} />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Dados da loja
        </h2>
        <StoreEditForm store={store} />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <StoreLinksManager links={links} />
      </div>

      {isIphoneStore ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Vitrine</h2>
          <StorefrontSettingsForm settings={resolveStorefrontSettings(store.storefrontSettings)} />
        </div>
      ) : null}
    </div>
  );
}
