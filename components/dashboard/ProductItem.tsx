"use client";

import { useState } from "react";
import {
  deleteProductAction,
  moveProductAction,
  toggleProductActiveAction,
  updateProductAction,
} from "@/app/dashboard/loja/produtos/actions";
import { formatCentsToBRL } from "@/lib/money";
import { ProductForm, type CategoryOption } from "./ProductForm";

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

export function ProductItem({ product, categories }: { product: ProductItemData; categories: CategoryOption[] }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ProductForm
        action={updateProductAction}
        categories={categories}
        productId={product.id}
        defaultCategoryId={product.categoryId}
        defaultValues={{
          name: product.name,
          price: (product.priceCents / 100).toFixed(2).replace(".", ","),
          unitLabel: product.unitLabel ?? "",
          description: product.description ?? "",
          imageUrl: product.imageUrl ?? "",
        }}
        submitLabel="Salvar produto"
        onDone={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className={`flex items-center justify-between gap-2 py-1.5 ${product.isActive ? "" : "opacity-50"}`}>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {product.name} {product.unitLabel ? <span className="text-zinc-500">{product.unitLabel}</span> : null}
        </p>
        <p className="text-sm text-zinc-500">{formatCentsToBRL(product.priceCents)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1 text-sm">
        <form action={moveProductAction}>
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="direction" value="up" />
          <button type="submit" className="px-1 text-zinc-500 hover:text-foreground" aria-label="Mover para cima">
            ↑
          </button>
        </form>
        <form action={moveProductAction}>
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="direction" value="down" />
          <button type="submit" className="px-1 text-zinc-500 hover:text-foreground" aria-label="Mover para baixo">
            ↓
          </button>
        </form>
        <button type="button" onClick={() => setIsEditing(true)} className="px-1 underline">
          editar
        </button>
        <form action={toggleProductActiveAction}>
          <input type="hidden" name="productId" value={product.id} />
          <button type="submit" className="px-1 underline">
            {product.isActive ? "desativar" : "ativar"}
          </button>
        </form>
        <form action={deleteProductAction}>
          <input type="hidden" name="productId" value={product.id} />
          <button type="submit" className="px-1 text-red-600 underline">
            excluir
          </button>
        </form>
      </div>
    </div>
  );
}
