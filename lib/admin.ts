import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";

// Quem edita o catálogo global (fotos padrão de cada modelo/cor — ver
// db/schema.ts em iphoneCatalogVariants) precisa ser restrito: qualquer
// lojista logado só mexe na própria loja, mas o catálogo é lido por todo
// mundo que usa o template iphone-store, então escrever nele afeta todos.
//
// Um e-mail só (o dono do app), então uma allowlist por variável de
// ambiente resolve sem precisar de uma tabela/coluna de papéis ainda —
// CATALOG_ADMIN_EMAILS em wrangler.jsonc (não é segredo, é só um e-mail) e
// em .env.local pra rodar localmente.
function adminEmails(): string[] {
  return (process.env.CATALOG_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isCatalogAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

/** Redireciona pra fora de qualquer tela/action do catálogo global se o
 * e-mail logado não estiver na allowlist. Use no topo de toda página e
 * server action que leia/escreva iphoneCatalogModels/iphoneCatalogVariants
 * fora do fluxo somente-leitura que qualquer lojista já tem (o picker
 * "Escolher do catálogo" e a importação em massa continuam abertos pra
 * todos — só editar o catálogo em si é restrito). */
export async function requireCatalogAdmin() {
  const user = await requireUser();
  if (!isCatalogAdminEmail(user.email)) {
    redirect("/dashboard");
  }
  return user;
}
