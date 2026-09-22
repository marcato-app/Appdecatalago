import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { requireOwnedStoreWithTemplate } from "@/lib/stores";
import { getTemplateManifest } from "@/templates/registry";
import { StoreHome, type StoreHomeStats } from "@/components/dashboard/StoreHome";

// Um único round trip pros números da home. Eram quatro SELECTs sequenciais
// escritos separadamente, e esta é a primeira tela depois do login — é onde
// a espera mais aparece.
async function getStoreStats(storeId: string): Promise<StoreHomeStats> {
  const rows = await db.execute<{
    products: number;
    active_products: number;
    variants: number;
    variants_without_photo: number;
  }>(sql`
    select
      (select count(*) from products where store_id = ${storeId})::int as products,
      (select count(*) from products where store_id = ${storeId} and is_active)::int as active_products,
      (select count(*) from product_variants v
         join products p on p.id = v.product_id
        where p.store_id = ${storeId})::int as variants,
      (select count(*) from product_variants v
         join products p on p.id = v.product_id
        where p.store_id = ${storeId}
          and jsonb_array_length(coalesce(v.image_urls, '[]'::jsonb)) = 0)::int as variants_without_photo
  `);

  const row = rows[0];
  return {
    products: Number(row?.products ?? 0),
    activeProducts: Number(row?.active_products ?? 0),
    variants: Number(row?.variants ?? 0),
    variantsWithoutPhoto: Number(row?.variants_without_photo ?? 0),
  };
}

export default async function DashboardHomePage() {
  const { store, templateSlug } = await requireOwnedStoreWithTemplate();
  const manifest = templateSlug ? getTemplateManifest(templateSlug) : undefined;
  const stats = store.businessType === "catalog" ? await getStoreStats(store.id) : null;

  return (
    <StoreHome
      store={store}
      templateName={manifest?.name ?? null}
      isIphoneStore={manifest?.slug === "iphone-store"}
      stats={stats}
    />
  );
}
