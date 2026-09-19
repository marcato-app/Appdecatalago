import type { TemplateManifest } from "../types";

// Portfolio-family template: single scrolling page of blocks, with a
// different block set than barbearia-tnt (stats, chips, results carousel,
// reviews). See references/modelos/clinica-giullia-bandeira/ for the
// original static reference.
export const manifest: TemplateManifest = {
  slug: "clinica",
  name: "Vitrine com Resultados e Avaliações",
  businessType: "portfolio",
  description:
    "Página única com destaques em números, especialidades, carrossel de resultados e depoimentos. Ideal para clínicas, esteticistas, profissionais de saúde e beleza.",
  defaultTheme: {
    colors: {
      primary: "#B08A4E",
      background: "#FAF7F1",
      ink: "#2A2420",
      textDim: "#5A5148",
      line: "#E4DCCB",
    },
    fonts: {
      display: "Cormorant Garamond",
      body: "Manrope",
    },
  },
  blocks: [
    { type: "stats", label: "Números em destaque", required: false, maxItems: 4 },
    { type: "chips", label: "Especialidades/tratamentos", required: false, maxItems: 10 },
    { type: "results_carousel", label: "Carrossel de resultados", required: false, maxItems: 12 },
    { type: "about", label: "Sobre", required: false, maxItems: 1 },
    { type: "reviews", label: "Avaliações", required: false, maxItems: 10 },
    { type: "map", label: "Endereço", required: false, maxItems: 1 },
    { type: "links", label: "Links (WhatsApp, Instagram...)", required: true, maxItems: 8 },
  ],
};
