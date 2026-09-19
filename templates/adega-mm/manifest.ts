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
    colors: {
      primary: "#fa7d27",
      background: "#141110",
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
