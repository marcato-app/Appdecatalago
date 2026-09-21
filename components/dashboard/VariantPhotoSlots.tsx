"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { uploadImageAction } from "@/lib/uploads";

const MAX_PHOTOS = 4;

// Up to 4 photo slots for one product variant (color) — fill in order,
// each slot uploads independently via the same Server Action ImageUploadField
// uses. Fully controlled so the parent form (IphoneProductForm) owns the
// array of URLs across all variants.
export function VariantPhotoSlots({ images, onChange }: { images: string[]; onChange: (next: string[]) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const slotIndex = images.length;
    setPendingIndex(slotIndex);
    const formData = new FormData();
    formData.set("file", file);

    startUpload(formData, slotIndex);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const [, startTransition] = useTransition();
  function startUpload(formData: FormData, slotIndex: number) {
    startTransition(async () => {
      const result = await uploadImageAction(formData);
      setPendingIndex(null);
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        onChange([...images.slice(0, slotIndex), result.url, ...images.slice(slotIndex + 1)]);
      }
    });
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
          const url = images[index];
          if (url) {
            return (
              <div key={index} className="relative h-14 w-14 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element -- previewing an uploaded image */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl bg-black/60 text-[10px] text-white"
                  aria-label="Remover foto"
                >
                  ×
                </button>
              </div>
            );
          }

          if (index === images.length) {
            return (
              <label
                key={index}
                className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-lg border border-dashed border-zinc-300 text-[10px] text-zinc-400 hover:border-violet-400 hover:text-violet-500 dark:border-zinc-700"
              >
                {pendingIndex === index ? "..." : "Upload"}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={pendingIndex !== null}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            );
          }

          return (
            <div
              key={index}
              className="h-14 w-14 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800"
              aria-hidden="true"
            />
          );
        })}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
