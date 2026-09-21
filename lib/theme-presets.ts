// Curated palettes and font pairings offered in the store onboarding/edit
// forms ("Escolha de cores" / "Escolha de fontes"). Deliberately presets
// rather than a free color-wheel picker: a lojista picks a complete,
// pre-tuned look instead of assembling one color at a time, so every choice
// stays coherent the way the original reference designs are. Applying a
// preset overwrites `stores.theme` wholesale (see
// app/dashboard/loja/actions.ts), so a store never ends up with half of one
// palette mixed with half of another.

import type { TemplateTheme } from "@/templates/types";

export interface ColorPreset {
  id: string;
  label: string;
  colors: TemplateTheme["colors"];
}

// Every preset fills the same extended slot set adega-mm's manifest uses
// (primaryLight/primaryDim/backgroundSoft/card/rule) so templates that lean
// on those extra tokens keep looking intentional under any preset, not just
// the default one.
export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "laranja-adega",
    label: "Laranja Adega",
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
  },
  {
    id: "vermelho-boteco",
    label: "Vermelho Boteco",
    colors: {
      primary: "#ef4444",
      primaryLight: "#ff7a6b",
      primaryDim: "#b6281f",
      background: "#150e0e",
      backgroundSoft: "#1e1515",
      card: "#261a1a",
      rule: "#3a2424",
      ink: "#f7ece8",
      textDim: "#c9a9a1",
      line: "#402727",
    },
  },
  {
    id: "verde-garrafa",
    label: "Verde Garrafa",
    colors: {
      primary: "#3fae5c",
      primaryLight: "#6fd189",
      primaryDim: "#227a3c",
      background: "#0f1410",
      backgroundSoft: "#171e19",
      card: "#1d2620",
      rule: "#2b362e",
      ink: "#eef7ee",
      textDim: "#a9c2ad",
      line: "#2c3a30",
    },
  },
  {
    id: "azul-petroleo",
    label: "Azul Petróleo",
    colors: {
      primary: "#2f9bd6",
      primaryLight: "#64bdec",
      primaryDim: "#1c6f9c",
      background: "#0d1319",
      backgroundSoft: "#141c24",
      card: "#19232c",
      rule: "#253340",
      ink: "#eaf3fa",
      textDim: "#9fb4c4",
      line: "#24323f",
    },
  },
  {
    id: "roxo-noturno",
    label: "Roxo Noturno",
    colors: {
      primary: "#9c6bff",
      primaryLight: "#bd9aff",
      primaryDim: "#6f42d1",
      background: "#130f1a",
      backgroundSoft: "#1b1624",
      card: "#221b2c",
      rule: "#332943",
      ink: "#f2edf9",
      textDim: "#b6a7c9",
      line: "#33283f",
    },
  },
  {
    id: "branco-tech",
    label: "Branco Tech",
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
  },
];

export interface FontPreset {
  id: string;
  label: string;
  display: string;
  body: string;
  googleFontsHref: string;
}

export const FONT_PRESETS: FontPreset[] = [
  {
    id: "classico",
    label: "Clássico (Pacifico + Poppins)",
    display: "Pacifico",
    body: "Poppins",
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Pacifico&family=Poppins:wght@300;400;500;600;700&display=swap",
  },
  {
    id: "editorial",
    label: "Editorial (Playfair Display + Inter)",
    display: "Playfair Display",
    body: "Inter",
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap",
  },
  {
    id: "moderno",
    label: "Moderno (Montserrat)",
    display: "Montserrat",
    body: "Montserrat",
    googleFontsHref: "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap",
  },
  {
    id: "assinatura",
    label: "Assinatura (Dancing Script + Nunito)",
    display: "Dancing Script",
    body: "Nunito",
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Nunito:wght@300;400;500;600;700&display=swap",
  },
  {
    id: "elegante",
    label: "Elegante (Cormorant Garamond + Manrope)",
    display: "Cormorant Garamond",
    body: "Manrope",
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Manrope:wght@400;500;600;700&display=swap",
  },
];

export const DEFAULT_COLOR_PRESET_ID = "laranja-adega";
export const DEFAULT_FONT_PRESET_ID = "classico";

export function findColorPreset(id: string | undefined): ColorPreset | undefined {
  return COLOR_PRESETS.find((preset) => preset.id === id);
}

export function findFontPreset(id: string | undefined): FontPreset | undefined {
  return FONT_PRESETS.find((preset) => preset.id === id);
}

/** Matches a resolved theme's font family names back to the preset that
 * produces them, so the page can load the right Google Fonts stylesheet
 * without storing the URL itself in `stores.theme`. A template's own
 * default fonts (set in its manifest, not chosen from a preset) may not
 * match any preset exactly — in that case this builds the Google Fonts URL
 * directly from whatever family names the theme specifies, so a font is
 * never silently missing just because no preset happens to declare it. */
export function resolveFontsHref(fonts: TemplateTheme["fonts"]): string {
  const match = FONT_PRESETS.find((preset) => preset.display === fonts?.display && preset.body === fonts?.body);
  if (match) return match.googleFontsHref;

  const families = [fonts?.display, fonts?.body].filter(
    (family, index, all): family is string => Boolean(family) && all.indexOf(family) === index,
  );
  if (families.length === 0) return FONT_PRESETS[0].googleFontsHref;

  const query = families
    .map((family) => `family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@300;400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

/** Builds a full `stores.theme` override from a chosen color + font preset
 * id. Always sets every color slot (never a partial palette) so a store
 * never ends up with one preset's accent mixed with another's card/rule
 * tones — see the ColorPreset doc comment above. */
export function buildThemeOverride(colorPresetId: string | undefined, fontPresetId: string | undefined): TemplateTheme {
  const color = findColorPreset(colorPresetId) ?? findColorPreset(DEFAULT_COLOR_PRESET_ID)!;
  const font = findFontPreset(fontPresetId) ?? findFontPreset(DEFAULT_FONT_PRESET_ID)!;
  return { colors: color.colors, fonts: { display: font.display, body: font.body } };
}

/** Reverse of buildThemeOverride, for pre-selecting the right radio/swatch
 * when a form loads with a store's current theme. */
export function matchPresetIds(theme: TemplateTheme | undefined): { colorPresetId: string; fontPresetId: string } {
  const colorMatch = COLOR_PRESETS.find((preset) => preset.colors.primary === theme?.colors?.primary && preset.colors.background === theme?.colors?.background);
  const fontMatch = FONT_PRESETS.find((preset) => preset.display === theme?.fonts?.display && preset.body === theme?.fonts?.body);
  return {
    colorPresetId: colorMatch?.id ?? DEFAULT_COLOR_PRESET_ID,
    fontPresetId: fontMatch?.id ?? DEFAULT_FONT_PRESET_ID,
  };
}
