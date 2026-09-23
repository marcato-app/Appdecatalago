import Link from "next/link";
import { requireCatalogAdmin } from "@/lib/admin";
import { BulkPhotoImport } from "@/components/dashboard/BulkPhotoImport";
import { attachPhotosToCatalogVariantsAction, getCatalogPhotoTargetsAction } from "../actions";

export default async function CatalogoFotosPage() {
  await requireCatalogAdmin();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-6 py-10">
      <div>
        <Link href="/dashboard/catalogo" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Catálogo global
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Fotos em massa do catálogo</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Igual à importação de fotos de uma loja (compacte a pasta{" "}
          <span className="font-mono text-xs">Modelo/Cor/foto.jpg</span> num .zip e envie), mas grava no catálogo
          global — a foto passa a ser o padrão pra{" "}
          <strong className="font-semibold">toda loja que importar esse modelo Lacrado</strong>. Não altera produtos
          que uma loja já cadastrou.
        </p>
      </div>

      <BulkPhotoImport getTargets={getCatalogPhotoTargetsAction} attachPhotos={attachPhotosToCatalogVariantsAction} />
    </div>
  );
}
