"use client";

import { useActionState } from "react";
import { addBlockItemAction, type FormState } from "@/app/dashboard/(painel)/loja/conteudo/actions";
import { showToast } from "@/lib/toast";
import type { BlockType } from "@/templates/types";
import { ImageUploadField } from "./ImageUploadField";

const initialState: FormState = {};

interface FieldSpec {
  name: "imageUrl" | "title" | "subtitle" | "body";
  label: string;
  kind: "text" | "image" | "textarea";
}

function fieldsFor(type: BlockType): FieldSpec[] {
  switch (type) {
    case "team":
      return [
        { name: "imageUrl", label: "Foto", kind: "image" },
        { name: "title", label: "Nome", kind: "text" },
        { name: "subtitle", label: "Cargo", kind: "text" },
      ];
    case "gallery":
      return [{ name: "imageUrl", label: "Foto", kind: "image" }];
    case "stats":
      return [
        { name: "title", label: "Número (ex: +400)", kind: "text" },
        { name: "subtitle", label: "Rótulo (ex: Pacientes)", kind: "text" },
      ];
    case "chips":
      return [{ name: "title", label: "Texto", kind: "text" }];
    case "results_carousel":
      return [
        { name: "imageUrl", label: "Foto", kind: "image" },
        { name: "title", label: "Rótulo curto", kind: "text" },
        { name: "body", label: "Legenda", kind: "text" },
      ];
    case "about":
      return [
        { name: "imageUrl", label: "Foto (opcional)", kind: "image" },
        { name: "body", label: "Texto", kind: "textarea" },
      ];
    case "reviews":
      return [{ name: "body", label: "Depoimento", kind: "textarea" }];
    default:
      return [];
  }
}

export function AddBlockItemForm({ blockId, blockType }: { blockId: string; blockType: BlockType }) {
  const [state, formAction, isPending] = useActionState(async (prevState: FormState, formData: FormData) => {
    const result = await addBlockItemAction(prevState, formData);
    if (result.error) {
      showToast(result.error, true);
    } else {
      showToast("Adicionado");
    }
    return result;
  }, initialState);
  const fields = fieldsFor(blockType);
  const inputClass =
    "rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400";

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <input type="hidden" name="blockId" value={blockId} />
      {fields.map((field) =>
        field.kind === "image" ? (
          <ImageUploadField key={field.name} name={field.name} label={field.label} />
        ) : (
          <div key={field.name} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500">{field.label}</label>
            {field.kind === "textarea" ? (
              <textarea name={field.name} rows={2} className={inputClass} />
            ) : (
              <input name={field.name} type="text" className={inputClass} />
            )}
          </div>
        ),
      )}

      {blockType === "reviews" ? (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">Estrelas</label>
          <select name="stars" defaultValue="5" className={`${inputClass} bg-transparent`}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} estrelas
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {state?.error ? <p className="text-xs text-red-600">{state.error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        {isPending ? "Adicionando..." : "+ Adicionar"}
      </button>
    </form>
  );
}
