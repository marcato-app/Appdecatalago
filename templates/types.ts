// Shared types for the template registry. A "template" (modelo) pairs one of
// these manifests (declarative: which blocks it uses, in what order, and its
// default theme) with a matching component package under templates/<slug>/
// that does the actual rendering. See ARCHITECTURE.md for the full design.

export type BusinessType = "catalog" | "portfolio";

export type BlockType =
  | "stats"
  | "chips"
  | "team"
  | "gallery"
  | "reviews"
  | "results_carousel"
  | "about"
  | "map"
  | "links";

export interface BlockManifestEntry {
  type: BlockType;
  label: string;
  required: boolean;
  maxItems?: number;
}

export interface TemplateTheme {
  colors: {
    primary: string;
    background: string;
    ink: string;
    textDim: string;
    line: string;
    [key: string]: string;
  };
  fonts?: {
    display?: string;
    body?: string;
  };
}

export interface TemplateManifest {
  slug: string;
  name: string;
  businessType: BusinessType;
  description: string;
  defaultTheme: TemplateTheme;
  /** Only relevant for `businessType: "portfolio"` templates — declares which
   * blocks the template renders and in what order. Catalog-family templates
   * use the dedicated categories/products tables instead. */
  blocks?: BlockManifestEntry[];
}
