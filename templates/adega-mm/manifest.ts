import type { TemplateManifest } from "../types";

// Catalog-family template: 2-page shape (link hub + cardápio) with search
// and a WhatsApp-checkout cart. See references/modelos/adega-mm/ for the
// original static reference this was extracted from.
export const manifest: TemplateManifest = {
  slug: "adega-mm",
  name: "Cardápio de Bebidas",
  businessType: "catalog",
  description:
    "Catálogo de produtos com preço, busca e carrinho que monta o pedido no WhatsApp. Ideal para bares, adegas, restaurantes.",
  defaultTheme: {
    // Extra slots (primaryLight/primaryDim/backgroundSoft/card/rule) beyond
    // the 5 base ones exist so the default palette can reproduce the
    // original style.css exactly; a store's color preset (see
    // lib/theme-presets.ts) always sets every slot, so there's no mixed
    // palette from a partial override.
    colors: {
      primary: "#fa7d27",
      primaryLight: "#ff9a4d",
      primaryDim: "#c9601a",
      background: "#141110",
      backgroundSoft: "#1d1815",
      card: "#241d18",
      rule: "#362a21",
      ink: "#f7ede2",
      textDim: "#c2ab97",
      line: "#3a2e24",
    },
    fonts: {
      display: "Pacifico",
      body: "Poppins",
    },
  },
};
