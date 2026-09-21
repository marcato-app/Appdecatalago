// Upserts the global iPhone reference catalog (see db/iphone-catalog-data.ts)
// into iphone_catalog_models / iphone_catalog_variants. Run after every
// migration that touches those tables, same as `npm run db:seed`:
//   npx tsx db/seed-iphone-catalog.ts
import { eq } from "drizzle-orm";
import { db } from "./client";
import { iphoneCatalogModels, iphoneCatalogVariants } from "./schema";
import { IPHONE_CATALOG_DATA } from "./iphone-catalog-data";

async function main() {
  for (let i = 0; i < IPHONE_CATALOG_DATA.length; i++) {
    const entry = IPHONE_CATALOG_DATA[i];
    const existing = await db.query.iphoneCatalogModels.findFirst({ where: eq(iphoneCatalogModels.name, entry.name) });

    let modelId: string;
    if (existing) {
      await db
        .update(iphoneCatalogModels)
        .set({ description: entry.description, specsText: entry.specsText, sortOrder: i })
        .where(eq(iphoneCatalogModels.id, existing.id));
      modelId = existing.id;
      await db.delete(iphoneCatalogVariants).where(eq(iphoneCatalogVariants.modelId, modelId));
    } else {
      const [inserted] = await db
        .insert(iphoneCatalogModels)
        .values({ name: entry.name, description: entry.description, specsText: entry.specsText, sortOrder: i })
        .returning({ id: iphoneCatalogModels.id });
      modelId = inserted.id;
    }

    const variantRows = entry.colors.flatMap((color, colorIndex) =>
      entry.storageOptions.map((storageLabel, storageIndex) => ({
        modelId,
        color,
        storageLabel,
        sortOrder: colorIndex * entry.storageOptions.length + storageIndex,
      })),
    );
    await db.insert(iphoneCatalogVariants).values(variantRows);

    console.log(`seeded: ${entry.name} (${variantRows.length} combinações)`);
  }

  console.log("iphone catalog seed done.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
