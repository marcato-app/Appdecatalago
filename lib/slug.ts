// Reserved so a lojista can never claim a slug that collides with a platform
// route (see ARCHITECTURE.md "Rotas multi-loja").
const RESERVED_SLUGS = new Set([
  "dashboard",
  "api",
  "login",
  "signup",
  "admin",
  "app",
  "www",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "_next",
]);

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateSlugFormat(slug: string): string | null {
  if (slug.length < 3) return "O link precisa ter pelo menos 3 caracteres.";
  if (slug.length > 60) return "O link precisa ter no máximo 60 caracteres.";
  if (!SLUG_PATTERN.test(slug)) {
    return "Use apenas letras minúsculas, números e hífen (ex: loja-da-maria).";
  }
  if (RESERVED_SLUGS.has(slug)) return "Esse link é reservado, escolha outro.";
  return null;
}
