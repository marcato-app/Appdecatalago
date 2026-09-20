"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { uploadImageAction } from "@/lib/uploads";

// Drop-in replacement for a plain "cole a URL da imagem" text input. Keeps
// the same contract as before (a hidden field named `name` carrying the
// image URL) so every existing form/Server Action that reads
// formData.get(name) needs no changes — only how that URL gets there
// changes, from typing to an actual upload.
export function ImageUploadField({
  name,
  label,
  defaultValue,
  helpText,
  aspect = "square",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  helpText?: string;
  aspect?: "square" | "wide";
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadImageAction(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        setUrl(result.url);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 ${
            aspect === "wide" ? "h-16 w-28" : "h-16 w-16"
          }`}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element -- previewing an uploaded image, not a next/image-optimized asset
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="px-1 text-center text-[10px] text-zinc-400">sem foto</span>
          )}
        </div>

        <div className="flex flex-col items-start gap-1">
          <label className="cursor-pointer rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
            {isPending ? "Enviando..." : url ? "Trocar foto" : "Enviar foto"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={isPending}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {url ? (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="text-xs text-zinc-500 underline hover:text-red-600"
            >
              Remover
            </button>
          ) : null}
        </div>
      </div>

      {helpText ? <p className="text-xs text-zinc-500">{helpText}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <input type="hidden" name={name} value={url} />
    </div>
  );
}
