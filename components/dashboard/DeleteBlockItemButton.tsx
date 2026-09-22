"use client";

import { deleteBlockItemAction } from "@/app/dashboard/(painel)/loja/conteudo/actions";
import { showToast } from "@/lib/toast";

export function DeleteBlockItemButton({ itemId, confirmLabel }: { itemId: string; confirmLabel: string }) {
  return (
    <form
      action={async (formData) => {
        if (!window.confirm(`Excluir "${confirmLabel}"?`)) return;
        await deleteBlockItemAction(formData);
        showToast("Removido");
      }}
    >
      <input type="hidden" name="itemId" value={itemId} />
      <button type="submit" className="px-1 text-red-600 underline">
        excluir
      </button>
    </form>
  );
}
