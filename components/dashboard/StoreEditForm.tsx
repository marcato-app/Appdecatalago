"use client";

import { useActionState } from "react";
import { updateStoreAction, type FormState } from "@/app/dashboard/loja/actions";
import type { stores } from "@/db/schema";

const initialState: FormState = {};

type Store = typeof stores.$inferSelect;

export function StoreEditForm({ store }: { store: Store }) {
  const [state, formAction, isPending] = useActionState(updateStoreAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nome da loja
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={store.name}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-300"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="tagline" className="text-sm font-medium">
          Frase curta (tagline)
        </label>
        <input
          id="tagline"
          name="tagline"
          type="text"
          defaultValue={store.tagline ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-300"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="bio" className="text-sm font-medium">
          Sobre a loja
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={store.bio ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-300"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="whatsappNumber" className="text-sm font-medium">
          WhatsApp (com DDD)
        </label>
        <input
          id="whatsappNumber"
          name="whatsappNumber"
          type="tel"
          required
          defaultValue={store.whatsappNumber ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-300"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="instagramHandle" className="text-sm font-medium">
          Instagram (sem @)
        </label>
        <input
          id="instagramHandle"
          name="instagramHandle"
          type="text"
          defaultValue={store.instagramHandle ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-300"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="addressLine" className="text-sm font-medium">
          Endereço
        </label>
        <input
          id="addressLine"
          name="addressLine"
          type="text"
          defaultValue={store.addressLine ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-300"
        />
      </div>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-600">Salvo!</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 self-start rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
      >
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
