import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { templateManifests } from "@/templates/registry";

type Params = { slug: string; path?: string[] };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

// Public store route. Handles both page-set shapes described in
// ARCHITECTURE.md: a single scrolling page for portfolio templates (no
// `path`) and a 2-page shape for catalog templates (`path` = ['cardapio']).
//
// TODO (Fase 1): buscar a loja pelo slug no banco (404 se não existir ou não
// estiver `published`) e despachar para o componente do template certo com
// base em store.templateId.
export default async function StorePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug, path } = await params;

  if (!slug) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
      <p className="text-sm text-zinc-500">Página pública da loja (placeholder)</p>
      <h1 className="text-2xl font-semibold">
        /{slug}
        {path?.length ? `/${path.join("/")}` : ""}
      </h1>
      <p className="text-sm text-zinc-500">
        {templateManifests.length} modelos disponíveis no registro de templates.
      </p>
    </div>
  );
}
