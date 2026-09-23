import type { TemplateManifest } from "../types";

// Catalog-family template for used/new Apple product resellers (iPhone,
// Apple Watch, AirPods, iPad, Mac — see db/schema.ts productLine): same
// categories/products businessType as adega-mm, but products carry
// condition/grade/battery/variant fields instead of a single price+photo,
// and the public page is a single filterable grid + product detail (no
// separate "hub" page) — see templates/iphone-store/*. Kept the
// "iphone-store" slug/table names (not worth a mass rename) even though the
// store now sells the whole Apple line, not just iPhone.
export const manifest: TemplateManifest = {
  slug: "iphone-store",
  name: "Loja Apple",
  businessType: "catalog",
  description:
    "Vitrine de iPhone, Apple Watch, AirPods, iPad e Mac com condição, cor, armazenamento e fotos por variação, parcelamento e contato direto no WhatsApp. Ideal para revenda de produtos Apple novos e seminovos.",
  defaultTheme: {
    colors: {
      primary: "#ff6a1a",
      primaryLight: "#ff8a4d",
      primaryDim: "#d1550f",
      background: "#ffffff",
      backgroundSoft: "#f7f7f8",
      card: "#ffffff",
      rule: "#ececef",
      ink: "#111113",
      textDim: "#6b6b70",
      line: "#e4e4e8",
    },
    fonts: {
      display: "Montserrat",
      body: "Inter",
    },
  },
};
