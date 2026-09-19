import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, products } from "@/db/schema";
import { requireOwnedStore } from "@/lib/stores";
import { AddCategoryForm } from "@/components/dashboard/AddCategoryForm";
import { AddProductInline } from "@/components/dashboard/AddProductInline";
import { ProductItem } from "@/components/dashboard/ProductItem";
import { deleteCategoryAction, moveCategoryAction } from "./actions";
import type { CategoryOption } from "@/components/dashboard/ProductForm";

export default async function ProdutosPage() {
  const store = await requireOwnedStore();

  const [allCategories, allProducts] = await Promise.all([
    db.select().from(categories).where(eq(categories.storeId, store.id)).orderBy(asc(categories.sortOrder)),
    db.select().from(products).where(eq(products.storeId, store.id)).orderBy(asc(products.sortOrder)),
  ]);

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
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <Link href="/dashboard/loja" className="text-sm underline">
          ← Voltar
        </Link>
      </div>

      {sections.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhuma seção ainda. Crie a primeira abaixo (ex: &quot;Cervejas&quot;).</p>
      ) : null}

      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <div key={section.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
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

            <div className="mt-2 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
              {(productsByCategory.get(section.id) ?? []).map((product) => (
                <ProductItem key={product.id} product={product} categories={categoryOptions} />
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

                  <div className="mt-1 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
                    {(productsByCategory.get(group.id) ?? []).map((product) => (
                      <ProductItem key={product.id} product={product} categories={categoryOptions} />
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
