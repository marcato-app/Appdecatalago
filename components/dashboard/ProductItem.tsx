"use client";

import { useActionState, useState } from "react";
import {
  deleteProductAction,
  moveProductAction,
  toggleProductActiveAction,
  updateProductAction,
  type FormState,
} from "@/app/dashboard/loja/produtos/actions";
import { showToast } from "@/lib/toast";
import { ImageUploadField } from "./ImageUploadField";

export interface ProductItemData {
  id: string;
  name: string;
  unitLabel: string | null;
  priceCents: number;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  categoryId: string;
}

const initialState: FormState = {};

function priceToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

// Every field stays inline and editable all the time — no separate "editar"
// mode — matching how the reference admin panel (a lojista's existing
// price-editing tool) works: change a value, the row tints to show it's
// unsaved, hit Salvar. The photo stays visible inline (products lean on it
// now that upload exists); the description is common enough to keep but
// rare enough to edit that it's tucked behind "mais detalhes".
export function ProductItem({ product }: { product: ProductItemData }) {
  const [, formAction, isPending] = useActionState(async (prevState: FormState, formData: FormData) => {
    const result = await updateProductAction(prevState, formData);
    if (result.error) {
      showToast(result.error, true);
    } else {
      showToast("Salvo");
    }
    return result;
  }, initialState);

  const [name, setName] = useState(product.name);
  const [unitLabel, setUnitLabel] = useState(product.unitLabel ?? "");
  const [price, setPrice] = useState(priceToInput(product.priceCents));
  const [description, setDescription] = useState(product.description ?? "");
  const [showDescription, setShowDescription] = useState(false);

  const dirty =
    name !== product.name ||
    unitLabel !== (product.unitLabel ?? "") ||
    price !== priceToInput(product.priceCents) ||
    description !== (product.description ?? "");

  const inputClass =
    "rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-violet-400";

  return (
    <div
      className={`flex items-start gap-2 rounded-lg px-2 py-2 transition-colors ${
        dirty ? "bg-violet-50 dark:bg-violet-950/30" : ""
      } ${product.isActive ? "" : "opacity-50"}`}
    >
      <div className="flex shrink-0 flex-col pt-1">
        <form action={moveProductAction}>
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="direction" value="up" />
          <button type="submit" className="block px-1 text-xs leading-none text-zinc-500 hover:text-foreground" aria-label="Mover para cima">
            ▲
          </button>
        </form>
        <form action={moveProductAction}>
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="direction" value="down" />
          <button type="submit" className="block px-1 text-xs leading-none text-zinc-500 hover:text-foreground" aria-label="Mover para baixo">
            ▼
          </button>
        </form>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <form action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="categoryId" value={product.categoryId} />

          <div className="flex flex-wrap items-center gap-2">
            <input
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome"
              className={`${inputClass} min-w-0 flex-1`}
            />
            <input
              name="unitLabel"
              type="text"
              value={unitLabel}
              onChange={(event) => setUnitLabel(event.target.value)}
              placeholder="Unidade"
              className={`${inputClass} w-24 shrink-0`}
            />
            <input
              name="price"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="R$0,00"
              className={`${inputClass} w-24 shrink-0 font-semibold text-violet-700 dark:text-violet-300`}
            />
            <button
              type="submit"
              disabled={isPending}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
                dirty
                  ? "bg-violet-600 text-white hover:bg-violet-700"
                  : "border border-zinc-300 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              {isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>

          <ImageUploadField name="imageUrl" label="Foto" defaultValue={product.imageUrl} aspect="wide" />

          {showDescription ? (
            <textarea
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              placeholder="Descrição (opcional)"
              className={inputClass}
            />
          ) : (
            <input type="hidden" name="description" value={description} />
          )}
        </form>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button type="button" onClick={() => setShowDescription((v) => !v)} className="text-zinc-500 underline hover:text-foreground">
            {showDescription ? "ocultar descrição" : "descrição"}
          </button>

          <form action={toggleProductActiveAction}>
            <input type="hidden" name="productId" value={product.id} />
            <button type="submit" className="text-zinc-500 underline hover:text-foreground">
              {product.isActive ? "desativar" : "ativar"}
            </button>
          </form>

          <form
            action={async (formData) => {
              if (!window.confirm(`Excluir "${product.name}"?`)) return;
              await deleteProductAction(formData);
              showToast("Produto removido");
            }}
          >
            <input type="hidden" name="productId" value={product.id} />
            <button type="submit" className="text-red-600 underline hover:text-red-700">
              excluir
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
