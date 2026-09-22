"use client";

import { useActionState, useMemo, useState } from "react";
import { createStoreAction, type FormState } from "./actions";
import { BUSINESS_CATEGORIES } from "@/lib/business-categories";
import { templateManifests } from "@/templates/registry";
import { COLOR_PRESETS, DEFAULT_COLOR_PRESET_ID, DEFAULT_FONT_PRESET_ID, FONT_PRESETS } from "@/lib/theme-presets";

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
  const [businessCategory, setBusinessCategory] = useState(BUSINESS_CATEGORIES[0].id);
  const [templateSlug, setTemplateSlug] = useState(templateManifests[0].slug);
  const [colorPresetId, setColorPresetId] = useState(DEFAULT_COLOR_PRESET_ID);
  const [colorPresetEditedManually, setColorPresetEditedManually] = useState(false);
  const [fontPresetId, setFontPresetId] = useState(DEFAULT_FONT_PRESET_ID);

  function handleTemplateChange(slug: string) {
    setTemplateSlug(slug);
    // "Branco Tech" reads much closer to the iPhone reference than the dark
    // presets every other template defaults to — auto-picked once, same as
    // the slug auto-fill above, but never overrides an explicit choice.
    if (!colorPresetEditedManually) {
      setColorPresetId(slug === "iphone-store" ? "branco-tech" : DEFAULT_COLOR_PRESET_ID);
    }
  }

  const recommendedSlugs = useMemo(
    () => BUSINESS_CATEGORIES.find((c) => c.id === businessCategory)?.recommendedTemplateSlugs ?? [],
    [businessCategory],
  );

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold tracking-tight">Crie sua loja</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Leva menos de 2 minutos. Você pode mudar tudo isso depois.
        </p>

        <form
          action={formAction}
          className="mt-6 flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex flex-col gap-4">
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
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
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
                  className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-foreground outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
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
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="businessCategory" className="text-sm font-medium">
              Ramo de atividade
            </label>
            <select
              id="businessCategory"
              name="businessCategory"
              value={businessCategory}
              onChange={(event) => setBusinessCategory(event.target.value)}
              className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400"
            >
              {BUSINESS_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-500">Usamos isso pra te recomendar um modelo abaixo.</p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Modelo</span>
            <div className="flex flex-col gap-2">
              {templateManifests.map((template) => {
                const recommended = recommendedSlugs.includes(template.slug);
                return (
                  <label
                    key={template.slug}
                    className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3 text-sm transition-colors ${
                      templateSlug === template.slug
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
                          checked={templateSlug === template.slug}
                          onChange={() => handleTemplateChange(template.slug)}
                        />
                        <span className="font-medium">{template.name}</span>
                      </span>
                      {recommended ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                          Recomendado
                        </span>
                      ) : null}
                    </span>
                    <span className="pl-5 text-xs text-zinc-500">{template.description}</span>
                  </label>
                );
              })}
            </div>
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
                    onChange={() => {
                      setColorPresetEditedManually(true);
                      setColorPresetId(preset.id);
                    }}
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

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:opacity-60"
          >
            {isPending ? "Criando loja..." : "Criar loja"}
          </button>
        </form>
      </div>
    </div>
  );
}
