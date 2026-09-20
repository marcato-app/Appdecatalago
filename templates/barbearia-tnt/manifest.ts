import type { TemplateManifest } from "../types";

// Portfolio-family template: single scrolling page of blocks. See
// references/modelos/barbearia-tnt/ for the original static reference.
export const manifest: TemplateManifest = {
  slug: "barbearia-tnt",
  name: "Vitrine com Equipe e Galeria",
  businessType: "portfolio",
  description:
    "Página única com foto de capa, equipe em carrossel, galeria de trabalhos e endereço no mapa. Ideal para barbearias, salões, estúdios.",
  defaultTheme: {
    // primaryDark/accent/card are extra slots beyond the 5 base ones (same
    // pattern as adega-mm's manifest) so the default palette reproduces the
    // original exactly; a color preset always sets every slot.
    colors: {
      primary: "#c81d25",
      primaryDark: "#7c1116",
      accent: "#ffb020",
      background: "#0b0b0d",
      card: "#141416",
      ink: "#f5f3ee",
      textDim: "#8a8a86",
      line: "rgba(245,243,238,0.12)",
    },
    fonts: {
      display: "Poppins",
      body: "Poppins",
    },
  },
  // "map" (endereço) e "links" (Instagram, apps...) saíram da lista: já são
  // cobertos por campos dedicados de `stores` (addressLine, instagramHandle,
  // whatsappNumber) + store_links (App Store/Play Store/outros) — os mesmos
  // que o cadastro da loja já preenche pra qualquer template, sem precisar
  // duplicar isso como conteúdo de bloco.
  blocks: [
    { type: "team", label: "Equipe", required: false, maxItems: 12 },
    { type: "gallery", label: "Galeria de trabalhos (mural de cortes)", required: false, maxItems: 20 },
  ],
};
