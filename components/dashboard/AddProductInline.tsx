"use client";

import { useState } from "react";
import { addProductAction } from "@/app/dashboard/loja/produtos/actions";
import { ProductForm, type CategoryOption } from "./ProductForm";

export function AddProductInline({ categoryId, categories }: { categoryId: string; categories: CategoryOption[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button type="button" onClick={() => setIsOpen(true)} className="text-sm underline text-zinc-500 hover:text-foreground">
        + Adicionar produto
      </button>
    );
  }

  return (
    <ProductForm
      action={addProductAction}
      categories={categories}
      defaultCategoryId={categoryId}
      submitLabel="Adicionar produto"
      onDone={() => setIsOpen(false)}
    />
  );
}
