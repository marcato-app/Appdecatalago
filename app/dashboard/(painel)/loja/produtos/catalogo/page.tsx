import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { requireOwnedStoreWithTemplate } from "@/lib/stores";
import { getCatalogModels } from "@/lib/iphone-catalog";
import { getTemplateManifest } from "@/templates/registry";
import { CatalogImport, type CatalogImportModel } from "@/components/dashboard/CatalogImport";

type Condition = "lacrado" | "seminovo" | "cpo";

export default async function CatalogoPage() {
  const { store, templateSlug } = await requireOwnedStoreWithTemplate();
  const manifest = templateSlug ? getTemplateManifest(templateSlug) : undefined;
  if (manifest?.slug !== "iphone-store") {
    redirect("/dashboard/loja/produtos");
  }

  const catalog = await getCatalogModels();

  // Quais desses modelos o lojista já tem (e em qual condição) — só pra
  // avisar na lista; cadastrar de novo continua permitido, já que o mesmo
  // modelo lacrado e seminovo são dois anúncios diferentes.
  const existing =
    catalog.length === 0
      ? []
      : await db
          .select({ name: products.name, condition: products.condition })
          .from(products)
          .where(
            and(
              eq(products.storeId, store.id),
              inArray(
                products.name,
                catalog.map((model) => model.name),
              ),
            ),
          );

  const alreadyByName = new Map<string, Condition[]>();
  for (const row of existing) {
    if (!row.condition) continue;
    const list = alreadyByName.get(row.name) ?? [];
    if (!list.includes(row.condition)) list.push(row.condition);
    alreadyByName.set(row.name, list);
  }

  const models: CatalogImportModel[] = catalog.map((model) => ({
    id: model.id,
    name: model.name,
    colors: model.colors,
    storages: model.storages,
    alreadyIn: alreadyByName.get(model.name) ?? [],
  }));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-6 py-10">
      <div>
        <Link href="/dashboard/loja/produtos" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Aparelhos
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Catálogo de iPhones</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {models.length} modelos prontos, com descrição, ficha técnica, cores e capacidades. Marque os que você vende,
          ponha o preço e monte a loja inteira de uma vez. As fotos você adiciona depois em cada aparelho.
        </p>
      </div>

      {models.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          O catálogo ainda não foi carregado no banco.
        </p>
      ) : (
        <CatalogImport models={models} />
      )}
    </div>
  );
}
