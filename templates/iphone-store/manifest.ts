import type { TemplateManifest } from "../types";

// Catalog-family template for used/new iPhone resellers: same
// categories/products businessType as adega-mm, but products carry
// condition/grade/battery/variant fields (see db/schema.ts) instead of a
// single price+photo, and the public page is a single filterable grid +
// product detail (no separate "hub" page) — see templates/iphone-store/*.
export const manifest: TemplateManifest = {
  slug: "iphone-store",
  name: "Loja de iPhones",
  businessType: "catalog",
  description:
    "Vitrine de aparelhos com condição, cor, armazenamento e fotos por variação, parcelamento e contato direto no WhatsApp. Ideal para revenda de iPhones novos e seminovos.",
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
