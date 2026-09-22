"use client";

import { useState } from "react";
import {
  addIphoneProductAction,
  updateIphoneProductAction,
  type FormState,
} from "@/app/dashboard/(painel)/loja/produtos/iphone-actions";
import { deleteProductAction, toggleProductActiveAction } from "@/app/dashboard/(painel)/loja/produtos/actions";
import { showToast } from "@/lib/toast";
import { formatCentsToBRL } from "@/lib/money";
import { IPHONE_CONDITION_LABELS } from "@/lib/iphone-models";
import { IphoneProductForm, type IphoneProductDefaults } from "./IphoneProductForm";

export interface IphoneProductRowData {
  id: string;
  name: string;
  condition: "lacrado" | "seminovo" | "cpo" | null;
  grade: string | null;
  batteryHealthPct: number | null;
  description: string | null;
  includedItems: string[];
  isActive: boolean;
  variants: { id: string; color: string; storageLabel: string | null; priceCents: number; imageUrls: string[] }[];
}

function toDefaults(product: IphoneProductRowData): IphoneProductDefaults {
  return {
    name: product.name,
    condition: product.condition ?? "seminovo",
    grade: product.grade ?? "A",
    batteryHealthPct: product.batteryHealthPct !== null ? String(product.batteryHealthPct) : "",
    description: product.description ?? "",
    includedItems: product.includedItems,
    isActive: product.isActive,
    variants: product.variants.map((v) => ({
      key: v.id,
      color: v.color,
      storageLabel: v.storageLabel ?? "",
      price: (v.priceCents / 100).toFixed(2).replace(".", ","),
      imageUrls: v.imageUrls,
    })),
  };
}

export function IphoneProductRow({ product }: { product: IphoneProductRowData }) {
  const [isEditing, setIsEditing] = useState(false);

  const cheapest = product.variants.reduce((min, v) => (v.priceCents < min.priceCents ? v : min), product.variants[0]);
  const thumbnail = cheapest?.imageUrls[0] ?? null;
  const metaLabel =
    product.variants.length === 1
      ? [product.variants[0].storageLabel, product.variants[0].color].filter(Boolean).join(" · ")
      : `${product.variants.length} opções`;

  if (isEditing) {
    return (
      <IphoneProductForm
        action={updateIphoneProductAction as (prevState: FormState, formData: FormData) => Promise<FormState>}
        productId={product.id}
        defaultValues={toDefaults(product)}
        submitLabel="Salvar"
        onDone={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element -- uploaded via R2
          <img src={thumbnail} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{product.name}</p>
        <p className="truncate text-xs text-zinc-500">
          {product.condition ? IPHONE_CONDITION_LABELS[product.condition] : ""} · {metaLabel}
        </p>
        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{cheapest ? formatCentsToBRL(cheapest.priceCents) : ""}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1 text-sm">
        <form action={toggleProductActiveAction}>
          <input type="hidden" name="productId" value={product.id} />
          <button
            type="submit"
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              product.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
            }`}
            title={product.isActive ? "Ativo — clique pra ocultar" : "Oculto — clique pra ativar"}
          >
            {product.isActive ? "Ativo" : "Oculto"}
          </button>
        </form>
        <button type="button" onClick={() => setIsEditing(true)} className="px-1 text-zinc-500 hover:text-foreground">
          editar
        </button>
        <form
          action={async (formData) => {
            if (!window.confirm(`Excluir "${product.name}"?`)) return;
            await deleteProductAction(formData);
            showToast("Aparelho removido");
          }}
        >
          <input type="hidden" name="productId" value={product.id} />
          <button type="submit" className="px-1 text-red-600 underline">
            excluir
          </button>
        </form>
      </div>
    </div>
  );
}

export function AddIphoneProductInline() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="self-start rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
      >
        + Cadastrar
      </button>
    );
  }

  return (
    <IphoneProductForm
      action={addIphoneProductAction as (prevState: FormState, formData: FormData) => Promise<FormState>}
      submitLabel="Adicionar aparelho"
      onDone={() => setIsOpen(false)}
    />
  );
}
