"use client";

import { useActionState } from "react";
import { addCategoryAction, type FormState } from "@/app/dashboard/(painel)/loja/produtos/actions";
import { showToast } from "@/lib/toast";

const initialState: FormState = {};

export function AddCategoryForm({ parentId, label }: { parentId?: string; label: string }) {
  const [state, formAction, isPending] = useActionState(async (prevState: FormState, formData: FormData) => {
    const result = await addCategoryAction(prevState, formData);
    if (result.error) {
      showToast(result.error, true);
    } else {
      showToast("Adicionado");
    }
    return result;
  }, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      {parentId ? <input type="hidden" name="parentId" value={parentId} /> : null}
      <input
        type="text"
        name="name"
        placeholder={label}
        required
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        + {label}
      </button>
      {state?.error ? <p className="w-full text-sm text-red-600">{state.error}</p> : null}
    </form>
  );
}
