"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/dashboard/(painel)/loja/produtos/actions";
import { showToast } from "@/lib/toast";
import { ImageUploadField } from "./ImageUploadField";

const initialState: FormState = {};

export interface CategoryOption {
  id: string;
  label: string;
}

export function ProductForm({
  action,
  categories,
  productId,
  defaultCategoryId,
  defaultValues,
  submitLabel,
  onDone,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  categories: CategoryOption[];
  productId?: string;
  defaultCategoryId?: string;
  defaultValues?: {
    name: string;
    price: string;
    unitLabel: string;
    description: string;
    imageUrl: string;
  };
  submitLabel: string;
  onDone?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(async (prevState: FormState, formData: FormData) => {
    const result = await action(prevState, formData);
    if (result.error) {
      showToast(result.error, true);
    } else {
      showToast(productId ? "Salvo" : "Produto adicionado");
      onDone?.();
    }
    return result;
  }, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      {productId ? <input type="hidden" name="productId" value={productId} /> : null}

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          name="name"
          placeholder="Nome do produto"
          required
          defaultValue={defaultValues?.name}
          className="col-span-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
        />
        <input
          type="text"
          name="price"
          inputMode="decimal"
          placeholder="Preço (12,50)"
          required
          defaultValue={defaultValues?.price}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
        />
        <input
          type="text"
          name="unitLabel"
          placeholder="Unidade (opcional, ex: 350ml)"
          defaultValue={defaultValues?.unitLabel}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
        />
        <select
          name="categoryId"
          required
          defaultValue={defaultCategoryId}
          className="col-span-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          placeholder="Descrição (opcional)"
          rows={2}
          defaultValue={defaultValues?.description}
          className="col-span-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
        />
        <div className="col-span-2">
          <ImageUploadField name="imageUrl" label="Foto (opcional)" defaultValue={defaultValues?.imageUrl} />
        </div>
      </div>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-violet-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
        >
          {isPending ? "Salvando..." : submitLabel}
        </button>
        {onDone ? (
          <button type="button" onClick={onDone} className="text-sm text-zinc-500 underline">
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
