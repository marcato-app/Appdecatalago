import { redirect } from "next/navigation";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, iphoneCatalogModels, iphoneCatalogVariants, products, productVariants, templates } from "@/db/schema";
import { requireOwnedStore } from "@/lib/stores";
import { getTemplateManifest } from "@/templates/registry";
import { AddCategoryForm } from "@/components/dashboard/AddCategoryForm";
import { AddProductInline } from "@/components/dashboard/AddProductInline";
import { ProductItem } from "@/components/dashboard/ProductItem";
import { AddIphoneProductInline, IphoneProductRow } from "@/components/dashboard/IphoneProductRow";
import type { CatalogModelOption } from "@/components/dashboard/IphoneProductForm";
import { IPHONE_CONDITION_LABELS } from "@/lib/iphone-models";
import { deleteCategoryAction, moveCategoryAction } from "./actions";
import type { CategoryOption } from "@/components/dashboard/ProductForm";

async function getCatalogModelOptions(): Promise<CatalogModelOption[]> {
  const [models, variants] = await Promise.all([
    db.select().from(iphoneCatalogModels).orderBy(asc(iphoneCatalogModels.sortOrder)),
    db.select().from(iphoneCatalogVariants).orderBy(asc(iphoneCatalogVariants.sortOrder)),
  ]);

  const variantsByModel = new Map<string, typeof variants>();
  for (const variant of variants) {
    const list = variantsByModel.get(variant.modelId) ?? [];
    list.push(variant);
    variantsByModel.set(variant.modelId, list);
  }

  return models.map((model) => ({
    id: model.id,
    name: model.name,
    description: model.description,
    specsText: model.specsText,
    variants: (variantsByModel.get(model.id) ?? []).map((v) => ({ color: v.color, storageLabel: v.storageLabel })),
  }));
}

async function IphoneProdutosPage({ storeId }: { storeId: string }) {
  const [productRows, catalogModels] = await Promise.all([
    db.select().from(products).where(eq(products.storeId, storeId)).orderBy(asc(products.sortOrder)),
    getCatalogModelOptions(),
  ]);

  const variantRows =
    productRows.length === 0
      ? []
      : await db
          .select()
          .from(productVariants)
          .where(
            inArray(
              productVariants.productId,
              productRows.map((p) => p.id),
            ),
          )
          .orderBy(asc(productVariants.sortOrder));

  const variantsByProduct = new Map<string, typeof variantRows>();
  for (const variant of variantRows) {
    const list = variantsByProduct.get(variant.productId) ?? [];
    list.push(variant);
    variantsByProduct.set(variant.productId, list);
  }

  const items = productRows.map((product) => ({
    id: product.id,
    name: product.name,
    condition: product.condition,
    grade: product.grade,
    batteryHealthPct: product.batteryHealthPct,
    description: product.description,
    includedItems: (product.includedItems as string[] | null) ?? [],
    isActive: product.isActive,
    variants: (variantsByProduct.get(product.id) ?? []).map((v) => ({
      id: v.id,
      color: v.color,
      storageLabel: v.storageLabel,
      priceCents: v.priceCents,
      imageUrls: (v.imageUrls as string[] | null) ?? [],
    })),
  }));

  const groups: { condition: "lacrado" | "seminovo" | "cpo"; label: string }[] = [
    { condition: "lacrado", label: IPHONE_CONDITION_LABELS.lacrado },
    { condition: "seminovo", label: IPHONE_CONDITION_LABELS.seminovo },
    { condition: "cpo", label: IPHONE_CONDITION_LABELS.cpo },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Aparelhos</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{items.length} aparelhos cadastrados.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Nenhum aparelho ainda. Cadastre o primeiro abaixo.
        </p>
      ) : (
        groups.map((group) => {
          const groupItems = items.filter((item) => item.condition === group.condition);
          if (groupItems.length === 0) return null;
          return (
            <div key={group.condition} className="flex flex-col gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {group.label} · {groupItems.length}
              </h2>
              {groupItems.map((item) => (
                <IphoneProductRow key={item.id} product={item} catalogModels={catalogModels} />
              ))}
            </div>
          );
        })
      )}

      <AddIphoneProductInline catalogModels={catalogModels} />
    </div>
  );
}

export default async function ProdutosPage() {
  const store = await requireOwnedStore();
  if (store.businessType !== "catalog") {
    redirect("/dashboard/loja/conteudo");
  }

  const templateRow = await db.query.templates.findFirst({ where: eq(templates.id, store.templateId) });
  const manifest = templateRow ? getTemplateManifest(templateRow.slug) : undefined;
  if (manifest?.slug === "iphone-store") {
    return <IphoneProdutosPage storeId={store.id} />;
  }

  const [allCategories, allProductRows] = await Promise.all([
    db.select().from(categories).where(eq(categories.storeId, store.id)).orderBy(asc(categories.sortOrder)),
    db.select().from(products).where(eq(products.storeId, store.id)).orderBy(asc(products.sortOrder)),
  ]);
  // categoryId is only nullable for the iphone-store template's products
  // (see db/schema.ts) — this branch never runs for that template.
  const allProducts = allProductRows.filter((p): p is typeof p & { categoryId: string } => p.categoryId !== null);

  const sections = allCategories.filter((c) => !c.parentId);
  const groupsByParent = new Map<string, typeof allCategories>();
  for (const category of allCategories) {
    if (!category.parentId) continue;
    const list = groupsByParent.get(category.parentId) ?? [];
    list.push(category);
    groupsByParent.set(category.parentId, list);
  }

  const productsByCategory = new Map<string, typeof allProducts>();
  for (const product of allProducts) {
    const list = productsByCategory.get(product.categoryId) ?? [];
    list.push(product);
    productsByCategory.set(product.categoryId, list);
  }

  const hasChildOrProducts = (categoryId: string) =>
    (groupsByParent.get(categoryId)?.length ?? 0) > 0 || (productsByCategory.get(categoryId)?.length ?? 0) > 0;

  const categoryOptions: CategoryOption[] = allCategories.map((category) => ({
    id: category.id,
    label: category.parentId
      ? `${allCategories.find((c) => c.id === category.parentId)?.name ?? ""} → ${category.name}`
      : category.name,
  }));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Seções, grupos e itens do seu cardápio.</p>
      </div>

      {sections.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Nenhuma seção ainda. Crie a primeira abaixo (ex: &quot;Cervejas&quot;).
        </p>
      ) : null}

      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <div
            key={section.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{section.name}</h2>
              <div className="flex items-center gap-1 text-sm">
                <form action={moveCategoryAction}>
                  <input type="hidden" name="categoryId" value={section.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" className="px-1 text-zinc-500 hover:text-foreground">
                    ↑
                  </button>
                </form>
                <form action={moveCategoryAction}>
                  <input type="hidden" name="categoryId" value={section.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button type="submit" className="px-1 text-zinc-500 hover:text-foreground">
                    ↓
                  </button>
                </form>
                {!hasChildOrProducts(section.id) ? (
                  <form action={deleteCategoryAction}>
                    <input type="hidden" name="categoryId" value={section.id} />
                    <button type="submit" className="px-1 text-red-600 underline">
                      excluir
                    </button>
                  </form>
                ) : null}
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-1">
              {(productsByCategory.get(section.id) ?? []).map((product) => (
                <ProductItem key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-2">
              <AddProductInline categoryId={section.id} categories={categoryOptions} />
            </div>

            <div className="mt-4 flex flex-col gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              {(groupsByParent.get(section.id) ?? []).map((group) => (
                <div key={group.id} className="pl-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{group.name}</h3>
                    <div className="flex items-center gap-1 text-sm">
                      <form action={moveCategoryAction}>
                        <input type="hidden" name="categoryId" value={group.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button type="submit" className="px-1 text-zinc-500 hover:text-foreground">
                          ↑
                        </button>
                      </form>
                      <form action={moveCategoryAction}>
                        <input type="hidden" name="categoryId" value={group.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button type="submit" className="px-1 text-zinc-500 hover:text-foreground">
                          ↓
                        </button>
                      </form>
                      {!hasChildOrProducts(group.id) ? (
                        <form action={deleteCategoryAction}>
                          <input type="hidden" name="categoryId" value={group.id} />
                          <button type="submit" className="px-1 text-red-600 underline">
                            excluir
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-1 flex flex-col gap-1">
                    {(productsByCategory.get(group.id) ?? []).map((product) => (
                      <ProductItem key={product.id} product={product} />
                    ))}
                  </div>
                  <div className="mt-2">
                    <AddProductInline categoryId={group.id} categories={categoryOptions} />
                  </div>
                </div>
              ))}

              <AddCategoryForm parentId={section.id} label="Novo grupo" />
            </div>
          </div>
        ))}
      </div>

      <AddCategoryForm label="Nova seção" />
    </div>
  );
}
