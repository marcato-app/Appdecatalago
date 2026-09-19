import type { TemplateTheme } from "@/templates/types";

// Merges a store's theme override (stores.theme jsonb) with its template's
// default theme, then renders it as CSS custom properties injected in the
// page <head> — the same pattern the 3 reference templates already use by
// hand (":root { --orange: ...; }"). Font family names are used as-is; a
// real font-loading strategy (Google Fonts per store) is future polish, not
// needed to prove the loop.
export function resolveTheme(defaultTheme: TemplateTheme, override: unknown): TemplateTheme {
  const overrideTheme = (override && typeof override === "object" ? override : {}) as Partial<TemplateTheme>;
  return {
    colors: { ...defaultTheme.colors, ...(overrideTheme.colors ?? {}) },
    fonts: { ...defaultTheme.fonts, ...(overrideTheme.fonts ?? {}) },
  };
}

function toCssVarName(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

export function themeToCssText(theme: TemplateTheme): string {
  const declarations: string[] = [];

  for (const [key, value] of Object.entries(theme.colors)) {
    declarations.push(`--color-${toCssVarName(key)}: ${value};`);
  }
  if (theme.fonts?.display) {
    declarations.push(`--font-display: '${theme.fonts.display}', serif;`);
  }
  if (theme.fonts?.body) {
    declarations.push(`--font-body: '${theme.fonts.body}', sans-serif;`);
  }

  return `:root { ${declarations.join(" ")} }`;
}
