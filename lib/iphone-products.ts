import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { products, productVariants } from "@/db/schema";

export type IphoneVariantRow = {
  id: string;
  color: string;
  storageLabel: string | null;
  priceCents: number;
  imageUrls: string[];
};

export type IphoneProductRowData = {
  id: string;
  name: string;
  productLine: "iphone" | "watch" | "airpods" | "ipad" | "mac";
  condition: "lacrado" | "seminovo" | "cpo" | null;
  grade: string | null;
  batteryHealthPct: number | null;
  description: string | null;
  includedItems: string[];
  isActive: boolean;
  sortOrder: number;
  variants: IphoneVariantRow[];
};

/** Every product of an iphone-store *with its variants*, in a single query.
 *
 * This used to be two sequential round trips (products, then variants for
 * those ids). On a database a region away from the Worker that second hop
 * was pure waiting, and it happened on both the dashboard list and the
 * public storefront — the two screens that get opened the most.
 *
 * `onlyActive` is what the public storefront passes; the dashboard wants
 * the hidden ones too so the lojista can turn them back on. */
export async function getIphoneProducts(
  storeId: string,
  { onlyActive = false, productId }: { onlyActive?: boolean; productId?: string } = {},
): Promise<IphoneProductRowData[]> {
  const conditions = [eq(products.storeId, storeId)];
  if (onlyActive) conditions.push(eq(products.isActive, true));
  if (productId) conditions.push(eq(products.id, productId));

  const rows = await db
    .select({ product: products, variant: productVariants })
    .from(products)
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .where(and(...conditions))
    .orderBy(asc(products.sortOrder), asc(productVariants.sortOrder));

  const byProduct = new Map<string, IphoneProductRowData>();
  for (const { product, variant } of rows) {
    let entry = byProduct.get(product.id);
    if (!entry) {
      entry = {
        id: product.id,
        name: product.name,
        productLine: product.productLine,
        condition: product.condition,
        grade: product.grade,
        batteryHealthPct: product.batteryHealthPct,
        description: product.description,
        includedItems: (product.includedItems as string[] | null) ?? [],
        isActive: product.isActive,
        sortOrder: product.sortOrder,
        variants: [],
      };
      byProduct.set(product.id, entry);
    }
    if (variant) {
      entry.variants.push({
        id: variant.id,
        color: variant.color,
        storageLabel: variant.storageLabel,
        priceCents: variant.priceCents,
        imageUrls: (variant.imageUrls as string[] | null) ?? [],
      });
    }
  }

  return [...byProduct.values()];
}
