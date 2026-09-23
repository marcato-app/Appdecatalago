import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, products } from "@/db/schema";
import { requireOwnedStoreWithTemplate } from "@/lib/stores";
import { getIphoneProducts } from "@/lib/iphone-products";
import { getTemplateManifest } from "@/templates/registry";
import { AddCategoryForm } from "@/components/dashboard/AddCategoryForm";
import { AddProductInline } from "@/components/dashboard/AddProductInline";
import { ProductItem } from "@/components/dashboard/ProductItem";
import { AddIphoneProductInline, IphoneProductRow } from "@/components/dashboard/IphoneProductRow";
import { IPHONE_CONDITION_LABELS, PRODUCT_LINE_LABELS, PRODUCT_LINE_ORDER, type ProductLine } from "@/lib/iphone-models";
import { deleteCategoryAction, moveCategoryAction } from "./actions";
import type { CategoryOption } from "@/components/dashboard/ProductForm";

async function IphoneProdutosPage({ storeId, activeLine }: { storeId: string; activeLine: ProductLine | null }) {
  const allItems = await getIphoneProducts(storeId);
  const items = activeLine ? allItems.filter((item) => item.productLine === activeLine) : allItems;
  const variantCount = items.reduce((total, item) => total + item.variants.length, 0);
  const countByLine = new Map<ProductLine, number>();
  for (const item of allItems) countByLine.set(item.productLine, (countByLine.get(item.productLine) ?? 0) + 1);

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
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {items.length} {items.length === 1 ? "aparelho cadastrado" : "aparelhos cadastrados"}
            {variantCount > 0 ? ` · ${variantCount} variações` : ""}.
          </p>
        </div>
        {items.length > 0 ? (
          <div className="flex shrink-0 gap-2">
            <Link
              href="/dashboard/loja/produtos/fotos"
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Fotos em massa
            </Link>
            <Link
              href="/dashboard/loja/produtos/catalogo"
              className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
            >
              Catálogo
            </Link>
          </div>
        ) : null}
      </div>

      {allItems.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          <Link
            href="/dashboard/loja/produtos"
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !activeLine
                ? "bg-violet-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            Todos · {allItems.length}
          </Link>
          {PRODUCT_LINE_ORDER.map((line) => (
            <Link
              key={line}
              href={`/dashboard/loja/produtos?linha=${line}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeLine === line
                  ? "bg-violet-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {PRODUCT_LINE_LABELS[line]} · {countByLine.get(line) ?? 0}
            </Link>
          ))}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
          <div>
            <p className="text-sm font-medium">
              {allItems.length === 0 ? "Sua vitrine está vazia" : `Nenhum ${PRODUCT_LINE_LABELS[activeLine!]} cadastrado ainda`}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
              O Flip já vem com um catálogo Apple pronto — descrição, ficha técnica, cores e capacidades de cada
              modelo. Escolha os que você vende, ponha o preço e a loja nasce pronta.
            </p>
          </div>
          <Link
            href="/dashboard/loja/produtos/catalogo"
            className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
          >
            Montar a loja pelo catálogo
          </Link>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            ou cadastre um aparelho de cada vez no botão abaixo
          </p>
        </div>
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
                <IphoneProductRow key={item.id} product={item} />
              ))}
            </div>
          );
        })
      )}

      <AddIphoneProductInline />
    </div>
  );
}

const PRODUCT_LINE_VALUES = new Set<string>(PRODUCT_LINE_ORDER);

export default async function ProdutosPage({ searchParams }: { searchParams: Promise<{ linha?: string }> }) {
  const { store, templateSlug } = await requireOwnedStoreWithTemplate();
  if (store.businessType !== "catalog") {
    redirect("/dashboard/loja/conteudo");
  }

  const manifest = templateSlug ? getTemplateManifest(templateSlug) : undefined;
  if (manifest?.slug === "iphone-store") {
    const { linha } = await searchParams;
    const activeLine = linha && PRODUCT_LINE_VALUES.has(linha) ? (linha as ProductLine) : null;
    return <IphoneProdutosPage storeId={store.id} activeLine={activeLine} />;
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
