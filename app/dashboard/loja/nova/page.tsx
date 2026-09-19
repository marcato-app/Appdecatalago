"use client";

import { useActionState, useState } from "react";
import { createStoreAction, type FormState } from "./actions";

const initialState: FormState = {};

function slugPreview(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NovaLojaPage() {
  const [state, formAction, isPending] = useActionState(createStoreAction, initialState);
  const [slug, setSlug] = useState("");
  const [slugEditedManually, setSlugEditedManually] = useState(false);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold">Crie sua loja</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Modelo: <strong>Cardápio de Bebidas</strong> (catálogo de produtos com preço, busca e
          pedido pelo WhatsApp).
        </p>

        <form action={formAction} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium">
              Nome da loja
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              onChange={(event) => {
                if (!slugEditedManually) setSlug(slugPreview(event.target.value));
              }}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="slug" className="text-sm font-medium">
              Link da loja
            </label>
            <div className="flex items-center gap-1 text-sm text-zinc-500">
              <span>seusite.com/</span>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                value={slug}
                onChange={(event) => {
                  setSlugEditedManually(true);
                  setSlug(event.target.value);
                }}
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-foreground outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-300"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="whatsappNumber" className="text-sm font-medium">
              WhatsApp (com DDD)
            </label>
            <input
              id="whatsappNumber"
              name="whatsappNumber"
              type="tel"
              placeholder="11987654321"
              required
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-300"
            />
          </div>

          {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
          >
            {isPending ? "Criando loja..." : "Criar loja"}
          </button>
        </form>
      </div>
    </div>
  );
}
