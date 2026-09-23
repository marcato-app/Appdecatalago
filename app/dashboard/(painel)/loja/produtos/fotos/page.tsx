import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOwnedStoreWithTemplate } from "@/lib/stores";
import { getTemplateManifest } from "@/templates/registry";
import { BulkPhotoImport } from "@/components/dashboard/BulkPhotoImport";
import {
  attachPhotosToVariantsAction,
  getBulkPhotoTargetsAction,
} from "@/app/dashboard/(painel)/loja/produtos/bulk-photos-actions";

export default async function FotosPage() {
  const { templateSlug } = await requireOwnedStoreWithTemplate();
  const manifest = templateSlug ? getTemplateManifest(templateSlug) : undefined;
  if (manifest?.slug !== "iphone-store") {
    redirect("/dashboard/loja/produtos");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-6 py-10">
      <div>
        <Link href="/dashboard/loja/produtos" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Aparelhos
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Fotos em massa</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Se suas fotos já estão organizadas em pastas — uma pasta por modelo, e dentro uma pasta por cor (ex:{" "}
          <span className="font-mono text-xs">iPhone 15 Pro Max / Titânio Natural / foto1.jpg</span>) — selecione a
          pasta principal e o Flip casa cada pasta com o aparelho e a cor certos na sua loja, sem precisar abrir um por
          um. O nome da pasta precisa bater com o nome do modelo já cadastrado (importe pelo Catálogo antes, se ainda
          não fez).
        </p>
      </div>

      <BulkPhotoImport getTargets={getBulkPhotoTargetsAction} attachPhotos={attachPhotosToVariantsAction} />
    </div>
  );
}
