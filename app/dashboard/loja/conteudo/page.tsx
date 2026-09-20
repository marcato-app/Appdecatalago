import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { templates } from "@/db/schema";
import { requireOwnedStore } from "@/lib/stores";
import { getStoreBlocks } from "@/lib/blocks";
import { getTemplateManifest } from "@/templates/registry";
import { BlockSection } from "@/components/dashboard/BlockSection";

export default async function ConteudoPage() {
  const store = await requireOwnedStore();
  if (store.businessType !== "portfolio") {
    redirect("/dashboard/loja/produtos");
  }

  const templateRow = await db.query.templates.findFirst({ where: eq(templates.id, store.templateId) });
  const manifest = templateRow ? getTemplateManifest(templateRow.slug) : undefined;
  const storeBlocks = await getStoreBlocks(store.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conteúdo</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Instagram, WhatsApp e endereço já ficam na tela da loja — aqui é só o conteúdo específico do seu modelo.
        </p>
      </div>

      {storeBlocks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Esse modelo não tem seções de conteúdo configuráveis.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {storeBlocks.map((block) => {
            const manifestEntry = manifest?.blocks?.find((b) => b.type === block.type);
            return (
              <BlockSection key={block.id} block={block} label={manifestEntry?.label ?? block.type} maxItems={manifestEntry?.maxItems} />
            );
          })}
        </div>
      )}
    </div>
  );
}
