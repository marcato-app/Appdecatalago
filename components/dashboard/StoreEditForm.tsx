"use client";

import { useActionState, useState } from "react";
import { updateStoreAction, type FormState } from "@/app/dashboard/(painel)/loja/actions";
import type { stores } from "@/db/schema";
import { BUSINESS_CATEGORIES } from "@/lib/business-categories";
import { COLOR_PRESETS, FONT_PRESETS, matchPresetIds } from "@/lib/theme-presets";
import { formatCnpj } from "@/lib/cnpj";
import type { TemplateTheme } from "@/templates/types";
import { ImageUploadField } from "./ImageUploadField";

const initialState: FormState = {};

type Store = typeof stores.$inferSelect;

export function StoreEditForm({ store }: { store: Store }) {
  const [state, formAction, isPending] = useActionState(updateStoreAction, initialState);
  const { colorPresetId: initialColorPresetId, fontPresetId: initialFontPresetId } = matchPresetIds(
    store.theme as TemplateTheme | undefined,
  );
  const [colorPresetId, setColorPresetId] = useState(initialColorPresetId);
  const [fontPresetId, setFontPresetId] = useState(initialFontPresetId);

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
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
        />
      </div>

      <ImageUploadField name="logoUrl" label="Foto/logo" defaultValue={store.logoUrl} />

      <ImageUploadField
        name="coverImageUrl"
        label="Foto de capa"
        helpText="Opcional — usada como fundo do topo em alguns modelos."
        defaultValue={store.coverImageUrl}
        aspect="wide"
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="tagline" className="text-sm font-medium">
          Frase curta (tagline)
        </label>
        <input
          id="tagline"
          name="tagline"
          type="text"
          defaultValue={store.tagline ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
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
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
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
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
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
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
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
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="cnpj" className="text-sm font-medium">
          CNPJ <span className="font-normal text-zinc-500">(opcional)</span>
        </label>
        <input
          id="cnpj"
          name="cnpj"
          type="text"
          placeholder="00.000.000/0000-00"
          defaultValue={store.cnpj ? formatCnpj(store.cnpj) : ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="professionalCredential" className="text-sm font-medium">
          Registro profissional <span className="font-normal text-zinc-500">(CRM, CRBM, CRO... opcional)</span>
        </label>
        <input
          id="professionalCredential"
          name="professionalCredential"
          type="text"
          placeholder="Ex: CRBM 67.764"
          defaultValue={store.professionalCredential ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="businessCategory" className="text-sm font-medium">
          Ramo de atividade
        </label>
        <select
          id="businessCategory"
          name="businessCategory"
          defaultValue={store.businessCategory ?? BUSINESS_CATEGORIES[0].id}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
        >
          {BUSINESS_CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Cores do site</span>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((preset) => (
            <label key={preset.id} className="flex cursor-pointer flex-col items-center gap-1">
              <input
                type="radio"
                name="colorPresetId"
                value={preset.id}
                checked={colorPresetId === preset.id}
                onChange={() => setColorPresetId(preset.id)}
                className="sr-only"
              />
              <span
                className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 ${
                  colorPresetId === preset.id ? "border-violet-500 dark:border-violet-400" : "border-transparent"
                }`}
                style={{ background: preset.colors.background }}
              >
                <span className="h-6 w-6 rounded-full" style={{ background: preset.colors.primary }} />
              </span>
              <span className="text-[11px] text-zinc-500">{preset.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="fontPresetId" className="text-sm font-medium">
          Fontes
        </label>
        <select
          id="fontPresetId"
          name="fontPresetId"
          value={fontPresetId}
          onChange={(event) => setFontPresetId(event.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
        >
          {FONT_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-600">Salvo!</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 self-start rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
