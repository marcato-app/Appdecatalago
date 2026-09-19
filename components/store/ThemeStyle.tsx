import { themeToCssText } from "@/lib/theme";
import type { TemplateTheme } from "@/templates/types";

// Rendered as a plain <style> tag in the page body — CSS applies
// document-wide regardless of where the tag sits in the DOM, no hoisting
// needed. Mirrors the ":root { --orange: ...; }" pattern the 3 reference
// templates already hand-roll.
export function ThemeStyle({ theme }: { theme: TemplateTheme }) {
  return <style dangerouslySetInnerHTML={{ __html: themeToCssText(theme) }} />;
}
