// Upserts one `templates` row per manifest in templates/registry.ts. Needed
// because stores.template_id is a required FK — run after every migration:
//   npm run db:seed
import { eq } from "drizzle-orm";
import { db } from "./client";
import { templates } from "./schema";
import { templateManifests } from "../templates/registry";

async function main() {
  for (const manifest of templateManifests) {
    const existing = await db.query.templates.findFirst({
      where: eq(templates.slug, manifest.slug),
    });

    const values = {
      slug: manifest.slug,
      name: manifest.name,
      businessType: manifest.businessType,
      defaultTheme: manifest.defaultTheme,
      blockManifest: manifest.blocks ?? [],
      isActive: true,
    };

    if (existing) {
      await db.update(templates).set(values).where(eq(templates.id, existing.id));
      console.log(`updated template: ${manifest.slug}`);
    } else {
      await db.insert(templates).values(values);
      console.log(`inserted template: ${manifest.slug}`);
    }
  }

  console.log("seed done.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
