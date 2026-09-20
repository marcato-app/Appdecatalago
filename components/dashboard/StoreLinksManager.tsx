"use client";

import { useActionState } from "react";
import { addStoreLinkAction, deleteStoreLinkAction, type LinkFormState } from "@/app/dashboard/loja/actions";
import type { storeLinks } from "@/db/schema";

const initialState: LinkFormState = {};

const LINK_TYPE_LABELS: Record<string, string> = {
  website: "Site",
  app_store: "App Store",
  play_store: "Play Store",
  custom: "Outro (Facebook, TikTok, etc.)",
};

type StoreLink = typeof storeLinks.$inferSelect;

export function StoreLinksManager({ links }: { links: StoreLink[] }) {
  const [state, formAction, isPending] = useActionState(addStoreLinkAction, initialState);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">Outros links e redes sociais</h2>
      <p className="text-xs text-zinc-500">
        Instagram e WhatsApp já têm campo próprio acima. Use isto pra site, Play Store/App Store, Facebook, TikTok etc.
      </p>

      {links.length > 0 ? (
        <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
          {links.map((link) => (
            <li key={link.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="font-medium">
                  {link.label} <span className="text-xs text-zinc-500">({LINK_TYPE_LABELS[link.type] ?? link.type})</span>
                </p>
                <p className="truncate text-xs text-zinc-500">{link.url}</p>
              </div>
              <form action={deleteStoreLinkAction}>
                <input type="hidden" name="linkId" value={link.id} />
                <button type="submit" className="shrink-0 text-xs text-red-600 underline">
                  excluir
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zinc-400">Nenhum link extra ainda.</p>
      )}

      <form action={formAction} className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            name="type"
            defaultValue="website"
            className="rounded-lg border border-zinc-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
          >
            {Object.entries(LINK_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            name="label"
            type="text"
            placeholder="Nome (ex: Facebook)"
            required
            className="flex-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
          />
        </div>
        <input
          name="url"
          type="url"
          placeholder="https://…"
          required
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
        />
        {state?.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {isPending ? "Adicionando..." : "Adicionar link"}
        </button>
      </form>
    </div>
  );
}
