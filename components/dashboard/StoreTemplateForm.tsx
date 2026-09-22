"use client";

import { useActionState, useState } from "react";
import { changeStoreTemplateAction, type FormState } from "@/app/dashboard/(painel)/loja/actions";
import { showToast } from "@/lib/toast";
import { templateManifests } from "@/templates/registry";

const initialState: FormState = {};

export function StoreTemplateForm({ currentSlug }: { currentSlug: string | null }) {
  const [state, formAction, isPending] = useActionState(async (prevState: FormState, formData: FormData) => {
    const result = await changeStoreTemplateAction(prevState, formData);
    if (result.error) showToast(result.error, true);
    else showToast("Modelo atualizado");
    return result;
  }, initialState);

  const [selected, setSelected] = useState(currentSlug ?? templateManifests[0].slug);
  const changed = selected !== currentSlug;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {templateManifests.map((template) => {
          const isCurrent = template.slug === currentSlug;
          return (
            <label
              key={template.slug}
              className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3 text-sm transition-colors ${
                selected === template.slug
                  ? "border-violet-500 bg-violet-50 dark:border-violet-400 dark:bg-violet-950/40"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="templateSlug"
                    value={template.slug}
                    checked={selected === template.slug}
                    onChange={() => setSelected(template.slug)}
                  />
                  <span className="font-medium">{template.name}</span>
                </span>
                {isCurrent ? (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    Atual
                  </span>
                ) : null}
              </span>
              <span className="pl-5 text-xs text-zinc-500">{template.description}</span>
            </label>
          );
        })}
      </div>

      {changed ? (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="applyDefaultTheme" defaultChecked />
          Aplicar as cores padrão desse modelo
        </label>
      ) : null}

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-600">Modelo atualizado!</p> : null}

      <button
        type="submit"
        disabled={isPending || !changed}
        className="mt-1 self-start rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:opacity-50"
      >
        {isPending ? "Trocando..." : changed ? "Trocar modelo" : "Modelo atual"}
      </button>

      {changed ? (
        <p className="text-xs text-zinc-500">
          Seus dados continuam salvos. Cada modelo mostra o que faz sentido pra ele — trocar não apaga nada.
        </p>
      ) : null}
    </form>
  );
}
