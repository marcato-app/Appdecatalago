import type { TemplateManifest } from "./types";
import { manifest as adegaMm } from "./adega-mm/manifest";
import { manifest as barbeariaTnt } from "./barbearia-tnt/manifest";
import { manifest as clinica } from "./clinica/manifest";

// Central lookup for every template manifest. Adding a 4th template means:
// 1. create templates/<slug>/manifest.ts (+ the rendering components, later)
// 2. add it to this list
// 3. insert a matching row in the `templates` table (db/schema.ts)
export const templateManifests: TemplateManifest[] = [adegaMm, barbeariaTnt, clinica];

export function getTemplateManifest(slug: string): TemplateManifest | undefined {
  return templateManifests.find((template) => template.slug === slug);
}
