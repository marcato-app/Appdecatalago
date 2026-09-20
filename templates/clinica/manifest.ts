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
    // primaryDeep is an extra slot beyond the 5 base ones (same pattern as
    // adega-mm/barbearia-tnt's manifests) so the default palette reproduces
    // the original exactly; a color preset always sets every slot.
    colors: {
      primary: "#B08A4E",
      primaryDeep: "#8C6C34",
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
  // "map"/"links" saíram — mesma razão do barbearia-tnt (ver comentário lá):
  // já cobertos por campos dedicados de `stores` + store_links.
  blocks: [
    { type: "stats", label: "Números em destaque", required: false, maxItems: 4 },
    { type: "chips", label: "Especialidades/tratamentos", required: false, maxItems: 10 },
    { type: "results_carousel", label: "Carrossel de resultados", required: false, maxItems: 12 },
    { type: "about", label: "Sobre", required: false, maxItems: 1 },
    { type: "reviews", label: "Avaliações", required: false, maxItems: 10 },
  ],
};
