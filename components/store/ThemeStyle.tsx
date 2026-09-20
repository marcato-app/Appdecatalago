import { themeToCssText } from "@/lib/theme";
import { resolveFontsHref } from "@/lib/theme-presets";
import type { TemplateTheme } from "@/templates/types";

// Rendered in the page <head> — CSS custom properties apply document-wide
// regardless of where the tag sits in the DOM, no hoisting needed. Mirrors
// the ":root { --orange: ...; }" pattern the reference templates already
// hand-roll. The Google Fonts <link> is resolved from the theme's font
// family names (see lib/theme-presets.ts) rather than stored on the store
// itself, so every store always loads exactly the stylesheet its chosen
// font preset needs — same runtime-Google-Fonts approach the original
// reference HTML uses, just driven by the store's choice instead of being
// hardcoded per file.
export function ThemeStyle({ theme }: { theme: TemplateTheme }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={resolveFontsHref(theme.fonts)} />
      <style dangerouslySetInnerHTML={{ __html: themeToCssText(theme) }} />
    </>
  );
}
