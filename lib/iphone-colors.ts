// Best-effort color name -> swatch hex, for the small dot next to each color
// option on the storefront (adega-mm-style "chip" dots). Unknown/custom
// color names (a lojista can type anything) fall back to a neutral gray
// dot rather than breaking — this is a cosmetic aid, not a source of truth.
const COLOR_SWATCHES: Record<string, string> = {
  preto: "#1c1c1e",
  branco: "#f5f5f7",
  azul: "#3b82f6",
  vermelho: "#ef4444",
  amarelo: "#f5c518",
  roxo: "#9c6bff",
  verde: "#3fae5c",
  rosa: "#f472b6",
  dourado: "#d4af6a",
  grafite: "#4b4b4d",
  prata: "#c8c9cb",
  titânio: "#7d7d80",
  titanio: "#7d7d80",
  laranja: "#fa7d27",
  ciano: "#22d3ee",
};

export function colorSwatch(colorName: string): string {
  const key = colorName.trim().toLowerCase();
  return COLOR_SWATCHES[key] ?? "#9ca3af";
}
