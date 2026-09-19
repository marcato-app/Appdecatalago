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
    colors: {
      primary: "#c81d25",
      background: "#0b0b0d",
      ink: "#f5f3ee",
      textDim: "#8a8a86",
      line: "rgba(245,243,238,0.12)",
    },
    fonts: {
      body: "Poppins",
    },
  },
  blocks: [
    { type: "team", label: "Equipe", required: false, maxItems: 12 },
    { type: "gallery", label: "Galeria de trabalhos", required: false, maxItems: 20 },
    { type: "map", label: "Endereço", required: false, maxItems: 1 },
    { type: "links", label: "Links (Instagram, apps...)", required: true, maxItems: 8 },
  ],
};
