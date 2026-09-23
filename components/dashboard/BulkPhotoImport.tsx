"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { unzipSync } from "fflate";
import { uploadImageAction } from "@/lib/uploads";
import {
  matchFolderGroups,
  parseRelativePath,
  isImageFileName,
  type MatchResult,
  type MatchTargetProduct,
} from "@/lib/photo-match";
import { MAX_VARIANT_PHOTOS, IPHONE_CONDITION_LABELS } from "@/lib/iphone-models";
import { showToast } from "@/lib/toast";

type FolderGroup = { modelFolder: string; colorFolder: string; files: File[] };

type GroupWithMatch = FolderGroup & { match: MatchResult };

function groupKey(modelFolder: string, colorFolder: string) {
  return `${modelFolder}::${colorFolder}`;
}

function mimeFromFileName(name: string): string {
  switch (name.toLowerCase().split(".").pop()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

/** Corrige o mojibake clássico de nome de arquivo com acento vindo de um
 * .zip feito no iPhone: o Arquivos grava o nome em UTF-8 (às vezes com
 * acento em forma decomposta, padrão do sistema de arquivos da Apple), mas
 * alguma etapa no caminho decodifica esses bytes como Latin-1 em vez de
 * UTF-8 — daí "Titânio" virar "TitaÌnio", "Geração" virar "GeracÌ§aÌo" etc.
 * Se o texto tem essa cara (e cabe inteiro em Latin-1, ou seja, é mesmo
 * bytes-como-texto e não Unicode de verdade), reinterpreta cada caractere
 * como um byte e decodifica de novo como UTF-8. Texto normal passa direto. */
function fixMojibake(text: string): string {
  if (!/[ÂÃÌ]/.test(text)) return text;
  if (![...text].every((ch) => ch.codePointAt(0)! <= 0xff)) return text;
  try {
    const bytes = Uint8Array.from(text, (ch) => ch.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes).normalize("NFC");
  } catch {
    return text; // não era esse tipo de mojibake — mantém como veio
  }
}

/** Descompacta um .zip no navegador e devolve um arquivo por foto, com o
 * caminho original (Modelo/Cor/foto.jpg) preservado em `webkitRelativePath`
 * — o mesmo campo que a seleção de pasta usa, então o resto do código nem
 * sabe a diferença entre as duas origens. */
function filesFromZip(bytes: Uint8Array): File[] {
  const entries = unzipSync(bytes);
  const files: File[] = [];

  for (const [rawPath, data] of Object.entries(entries)) {
    if (rawPath.endsWith("/") || !isImageFileName(rawPath)) continue; // pasta, ou algo que não é foto
    const path = fixMojibake(rawPath);
    const name = path.split("/").pop() ?? path;
    // File aceita um BlobPart normal — cria um ArrayBuffer novo porque o
    // Uint8Array que o fflate devolve pode compartilhar um buffer maior.
    const file = new File([new Uint8Array(data)], name, { type: mimeFromFileName(name) });
    Object.defineProperty(file, "webkitRelativePath", { value: path });
    files.push(file);
  }

  return files;
}

export interface BulkPhotoImportProps {
  /** Onde procurar os alvos (produtos/variações da loja, ou modelos/cores
   * do catálogo global) — a mesma tela serve os dois casos, só troca de
   * onde lê e onde grava. */
  getTargets: () => Promise<MatchTargetProduct[]>;
  attachPhotos: (payload: { variantIds: string[]; urls: string[] }) => Promise<{ ok: boolean; error?: string }>;
}

export function BulkPhotoImport({ getTargets, attachPhotos }: BulkPhotoImportProps) {
  const router = useRouter();
  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [groups, setGroups] = useState<GroupWithMatch[] | null>(null);
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});
  const [showUnmatched, setShowUnmatched] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [summary, setSummary] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);

  async function processFiles(files: File[]) {
    setIsReading(true);
    setSummary(null);

    const byGroup = new Map<string, FolderGroup>();
    for (const file of files) {
      // webkitRelativePath não está no lib.dom.d.ts do TS. Numa seleção de
      // pasta de verdade o navegador preenche; num arquivo vindo do .zip,
      // filesFromZip() já preencheu do mesmo jeito.
      const relPath = (file as unknown as { webkitRelativePath?: string }).webkitRelativePath;
      if (!relPath || !isImageFileName(file.name)) continue;
      const parsed = parseRelativePath(relPath);
      if (!parsed) continue;

      const key = groupKey(parsed.modelFolder, parsed.colorFolder);
      const group = byGroup.get(key) ?? { modelFolder: parsed.modelFolder, colorFolder: parsed.colorFolder, files: [] };
      group.files.push(file);
      byGroup.set(key, group);
    }

    const rawGroups = [...byGroup.values()].map((g) => ({
      ...g,
      // 1_frente antes de 2_traseira... e corta no teto de fotos por variação
      files: g.files.sort((a, b) => a.name.localeCompare(b.name)).slice(0, MAX_VARIANT_PHOTOS),
    }));

    if (rawGroups.length === 0) {
      setIsReading(false);
      showToast("Nenhuma foto encontrada — confira se a estrutura é Modelo/Cor/foto.", true);
      return;
    }

    const targets: MatchTargetProduct[] = await getTargets();
    const matchResults = matchFolderGroups(
      rawGroups.map(({ modelFolder, colorFolder, files }) => ({ modelFolder, colorFolder, fileCount: files.length })),
      targets,
    );

    const merged: GroupWithMatch[] = rawGroups
      .map((g, i) => ({ ...g, match: matchResults[i] }))
      .sort((a, b) => a.modelFolder.localeCompare(b.modelFolder) || a.colorFolder.localeCompare(b.colorFolder));

    setGroups(merged);
    setSkipped({});
    setIsReading(false);
  }

  async function handleZipSelected(file: File) {
    setIsReading(true);
    setSummary(null);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const files = filesFromZip(bytes);
      if (files.length === 0) {
        setIsReading(false);
        showToast("Não achei nenhuma foto dentro do .zip.", true);
        return;
      }
      await processFiles(files);
    } catch {
      setIsReading(false);
      showToast("Não consegui abrir esse .zip — confira se o arquivo não corrompeu.", true);
    }
  }

  const matchedGroups = (groups ?? []).filter((g) => g.match.matches.length > 0);
  const unmatchedGroups = (groups ?? []).filter((g) => g.match.matches.length === 0);
  const includedGroups = matchedGroups.filter((g) => !skipped[groupKey(g.modelFolder, g.colorFolder)]);
  const totalPhotos = includedGroups.reduce((sum, g) => sum + g.files.length, 0);
  const totalVariants = new Set(includedGroups.flatMap((g) => g.match.matches.map((m) => m.variantId))).size;

  async function confirmImport() {
    if (includedGroups.length === 0) return;
    setIsUploading(true);
    setProgress({ done: 0, total: totalPhotos });

    let uploadedPhotos = 0;
    let updatedVariants = 0;
    let failedFiles = 0;

    for (const group of includedGroups) {
      const urls: string[] = [];
      const results = await Promise.all(
        group.files.map(async (file) => {
          const formData = new FormData();
          formData.set("file", file);
          const result = await uploadImageAction(formData);
          setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
          return result;
        }),
      );
      for (const result of results) {
        if (result.url) urls.push(result.url);
        else failedFiles++;
      }
      if (urls.length === 0) continue;

      const variantIds = group.match.matches.map((m) => m.variantId);
      const attach = await attachPhotos({ variantIds, urls });
      if (attach.ok) {
        uploadedPhotos += urls.length;
        updatedVariants += variantIds.length;
      }
    }

    setIsUploading(false);
    setGroups(null);
    setSummary(
      `${uploadedPhotos} ${uploadedPhotos === 1 ? "foto enviada" : "fotos enviadas"} em ${updatedVariants} ${
        updatedVariants === 1 ? "variação" : "variações"
      }${failedFiles > 0 ? ` · ${failedFiles} falharam` : ""}`,
    );
    showToast("Fotos importadas");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip,application/zip,application/x-zip-compressed"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleZipSelected(file);
          event.target.value = "";
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        // webkitdirectory/directory não são props tipadas do React — só
        // funcionam como atributos HTML brutos mesmo. Sem suporte no Safari
        // do iPhone, por isso o .zip é a opção principal (ver abaixo).
        {...{ webkitdirectory: "true", directory: "true" }}
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) processFiles(Array.from(event.target.files));
          event.target.value = "";
        }}
      />

      {!groups ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => zipInputRef.current?.click()}
            disabled={isReading}
            className="rounded-2xl border-2 border-dashed border-zinc-300 bg-white p-6 text-center transition-colors hover:border-violet-400 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">
              {isReading ? "Lendo arquivo..." : "Selecionar arquivo .zip"}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              No app Arquivos do iPhone: toque e segure a pasta com as fotos → <strong>Compactar</strong> → selecione o
              .zip que aparecer
            </p>
          </button>

          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            disabled={isReading}
            className="text-center text-xs text-zinc-500 underline disabled:opacity-60 dark:text-zinc-400"
          >
            ou selecionar a pasta direto (só funciona em alguns navegadores de computador)
          </button>
        </div>
      ) : null}

      {summary ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {summary}
        </div>
      ) : null}

      {groups && !isUploading ? (
        <>
          <div className="flex flex-col gap-2">
            {matchedGroups.map((g) => {
              const key = groupKey(g.modelFolder, g.colorFolder);
              const isSkipped = skipped[key];
              const byProduct = new Map<string, { name: string; condition: string | null; labels: string[] }>();
              for (const m of g.match.matches) {
                const entry = byProduct.get(m.productId) ?? { name: m.productName, condition: m.productCondition, labels: [] };
                entry.labels.push(m.variantLabel);
                byProduct.set(m.productId, entry);
              }

              return (
                <div
                  key={key}
                  className={`flex items-start justify-between gap-3 rounded-xl border p-3 ${
                    isSkipped
                      ? "border-zinc-200 bg-zinc-50 opacity-50 dark:border-zinc-800 dark:bg-zinc-950"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {g.modelFolder} · {g.colorFolder}{" "}
                      <span className="font-normal text-zinc-500">— {g.files.length} fotos</span>
                    </p>
                    <div className="mt-1 flex flex-col gap-0.5">
                      {[...byProduct.values()].map((p, i) => (
                        <p key={i} className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                          → {p.name} {p.condition ? `(${IPHONE_CONDITION_LABELS[p.condition as "lacrado" | "seminovo" | "cpo"]})` : ""} ·{" "}
                          {p.labels.join(", ")}
                        </p>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSkipped((prev) => ({ ...prev, [key]: !prev[key] }))}
                    className="shrink-0 text-xs text-zinc-500 underline"
                  >
                    {isSkipped ? "incluir" : "pular"}
                  </button>
                </div>
              );
            })}
          </div>

          {unmatchedGroups.length > 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setShowUnmatched((v) => !v)}
                className="text-xs text-zinc-500 underline"
              >
                {showUnmatched ? "ocultar" : "ver"} {unmatchedGroups.length} pastas sem aparelho correspondente
              </button>
              {showUnmatched ? (
                <ul className="mt-2 flex flex-col gap-0.5">
                  {unmatchedGroups.map((g) => (
                    <li key={groupKey(g.modelFolder, g.colorFolder)} className="text-xs text-zinc-500 dark:text-zinc-400">
                      {g.modelFolder} · {g.colorFolder} ({g.files.length} fotos) — cadastre esse modelo pelo catálogo antes
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <p className="text-sm font-medium">
                {totalPhotos} {totalPhotos === 1 ? "foto" : "fotos"} · {totalVariants}{" "}
                {totalVariants === 1 ? "variação" : "variações"}
              </p>
              <button
                type="button"
                onClick={() => zipInputRef.current?.click()}
                className="text-xs text-violet-600 underline dark:text-violet-400"
              >
                trocar arquivo
              </button>
            </div>
            <button
              type="button"
              onClick={confirmImport}
              disabled={totalPhotos === 0}
              className="shrink-0 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
            >
              Importar fotos
            </button>
          </div>
        </>
      ) : null}

      {isUploading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full bg-violet-600 transition-all"
              style={{ width: `${progress.total === 0 ? 0 : (progress.done / progress.total) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Enviando {progress.done} de {progress.total} fotos...
          </p>
        </div>
      ) : null}
    </div>
  );
}
