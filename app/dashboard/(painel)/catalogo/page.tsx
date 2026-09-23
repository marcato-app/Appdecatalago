import Link from "next/link";
import { requireCatalogAdmin } from "@/lib/admin";
import { getCatalogModels } from "@/lib/iphone-catalog";

export default async function CatalogoAdminPage() {
  await requireCatalogAdmin();
  const catalog = await getCatalogModels();

  const totalVariants = catalog.reduce((sum, m) => sum + m.variants.length, 0);
  const variantsWithPhoto = catalog.reduce((sum, m) => sum + m.variants.filter((v) => v.imageUrls.length > 0).length, 0);
  const modelsWithoutAnyPhoto = catalog.filter((m) => m.variants.every((v) => v.imageUrls.length === 0));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catálogo global</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Fotos padrão por modelo/cor — visível só pra você. Toda loja que importa um modelo pelo Catálogo (com
          aparelho Lacrado) já nasce com essas fotos.
        </p>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-1 flex-col rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xl font-bold tabular-nums">{catalog.length}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">modelos</span>
        </div>
        <div className="flex flex-1 flex-col rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xl font-bold tabular-nums">
            {variantsWithPhoto}/{totalVariants}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">cores com foto</span>
        </div>
      </div>

      <Link
        href="/dashboard/catalogo/fotos"
        className="rounded-2xl bg-violet-600 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-violet-700"
      >
        Fotos em massa do catálogo
      </Link>

      {modelsWithoutAnyPhoto.length > 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
          <p className="text-xs font-medium text-zinc-500">{modelsWithoutAnyPhoto.length} modelos sem nenhuma foto ainda</p>
          <p className="mt-1 text-xs text-zinc-400">{modelsWithoutAnyPhoto.map((m) => m.name).join(", ")}</p>
        </div>
      ) : null}
    </div>
  );
}
