"use client";

import { useActionState, useEffect, useState } from "react";
import { getIphoneCatalogModelsAction, type FormState } from "@/app/dashboard/loja/produtos/iphone-actions";
import { showToast } from "@/lib/toast";
import {
  IPHONE_COLOR_OPTIONS,
  IPHONE_CONDITION_LABELS,
  IPHONE_GRADE_OPTIONS,
  IPHONE_INCLUDED_ITEM_OPTIONS,
  IPHONE_MODELS,
  IPHONE_STORAGE_OPTIONS,
} from "@/lib/iphone-models";
import { VariantPhotoSlots } from "./VariantPhotoSlots";

const initialState: FormState = {};

type Condition = "lacrado" | "seminovo" | "cpo";

export interface VariantDraft {
  key: string;
  color: string;
  storageLabel: string;
  price: string;
  imageUrls: string[];
}

export interface IphoneProductDefaults {
  name: string;
  condition: Condition;
  grade: string;
  batteryHealthPct: string;
  description: string;
  includedItems: string[];
  isActive: boolean;
  variants: VariantDraft[];
}

function emptyVariant(): VariantDraft {
  return { key: crypto.randomUUID(), color: "", storageLabel: "", price: "", imageUrls: [] };
}

export interface CatalogModelOption {
  id: string;
  name: string;
  description: string;
  specsText: string;
  variants: { color: string; storageLabel: string }[];
}

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400 dark:bg-transparent";

export function IphoneProductForm({
  action,
  productId,
  defaultValues,
  submitLabel,
  onDone,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  productId?: string;
  defaultValues?: IphoneProductDefaults;
  submitLabel: string;
  onDone?: () => void;
}) {
  // Fetched on demand instead of passed down as a prop from the server page
  // — this form only mounts when "Cadastrar"/"editar" is actually clicked,
  // so the ~30-model reference catalog no longer loads on every visit to
  // the produtos page, only when someone opens a form.
  const [catalogModels, setCatalogModels] = useState<CatalogModelOption[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    getIphoneCatalogModelsAction().then((models) => {
      if (!cancelled) setCatalogModels(models);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const [state, formAction, isPending] = useActionState(async (prevState: FormState, formData: FormData) => {
    const result = await action(prevState, formData);
    if (result.error) {
      showToast(result.error, true);
    } else {
      showToast(productId ? "Salvo" : "Aparelho adicionado");
      onDone?.();
    }
    return result;
  }, initialState);

  const [name, setName] = useState(defaultValues?.name ?? "");
  const [condition, setCondition] = useState<Condition>(defaultValues?.condition ?? "seminovo");
  const [grade, setGrade] = useState(defaultValues?.grade ?? "A");
  const [batteryHealthPct, setBatteryHealthPct] = useState(defaultValues?.batteryHealthPct ?? "100");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [includedItems, setIncludedItems] = useState<string[]>(defaultValues?.includedItems ?? []);
  const [customItem, setCustomItem] = useState("");
  const [isActive, setIsActive] = useState(defaultValues?.isActive ?? true);
  const [variants, setVariants] = useState<VariantDraft[]>(defaultValues?.variants ?? [emptyVariant()]);

  function updateVariant(key: string, patch: Partial<VariantDraft>) {
    setVariants((prev) => prev.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  }

  function toggleIncluded(item: string) {
    setIncludedItems((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  }

  function addCustomItem() {
    const trimmed = customItem.trim();
    if (!trimmed || includedItems.includes(trimmed)) return;
    setIncludedItems((prev) => [...prev, trimmed]);
    setCustomItem("");
  }

  function applyCatalogModel(modelId: string) {
    const model = catalogModels?.find((m) => m.id === modelId);
    if (!model) return;
    setName(model.name);
    setDescription([model.description, model.specsText].filter(Boolean).join("\n\n"));
    setVariants(
      model.variants.length > 0
        ? model.variants.map((v) => ({ key: crypto.randomUUID(), color: v.color, storageLabel: v.storageLabel, price: "", imageUrls: [] }))
        : [emptyVariant()],
    );
    showToast(
      `${model.variants.length} variações adicionadas — apague (×) as que você não tem e preencha o preço das que ficarem.`,
    );
  }

  const variantsJson = JSON.stringify(
    variants.map((v) => ({ color: v.color, storageLabel: v.storageLabel, price: v.price, imageUrls: v.imageUrls })),
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {productId ? <input type="hidden" name="productId" value={productId} /> : null}
      <input type="hidden" name="variantsJson" value={variantsJson} />
      {includedItems.map((item) => (
        <input key={item} type="hidden" name="includedItems" value={item} />
      ))}

      <div className="flex flex-col gap-1 rounded-lg border border-violet-200 bg-violet-50/50 p-3 dark:border-violet-900 dark:bg-violet-950/20">
        <label className="text-sm font-medium">Escolher do catálogo</label>
        {catalogModels === null ? (
          <p className="text-sm text-zinc-500">Carregando modelos...</p>
        ) : (
          <select
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) applyCatalogModel(event.target.value);
              event.target.value = "";
            }}
            className={inputClass}
          >
            <option value="">Selecionar modelo (preenche nome, descrição e variações)...</option>
            {catalogModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        )}
        <p className="text-xs text-zinc-500">
          Preenche modelo, descrição/ficha técnica e todas as combinações de cor/armazenamento — apague (×) as que você
          não tem em estoque e preencha o preço das que ficarem.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Modelo *</label>
        <input
          type="text"
          name="name"
          list="iphone-model-options"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex: iPhone 14 Pro Max"
          className={inputClass}
        />
        <datalist id="iphone-model-options">
          {IPHONE_MODELS.map((model) => (
            <option key={model} value={model} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Condição *</label>
        <div className="flex gap-2">
          {(Object.keys(IPHONE_CONDITION_LABELS) as Condition[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCondition(value)}
              className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                condition === value
                  ? "border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-400 dark:bg-violet-950/40 dark:text-violet-300"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              {IPHONE_CONDITION_LABELS[value]}
            </button>
          ))}
        </div>
        <input type="hidden" name="condition" value={condition} />
      </div>

      {condition === "seminovo" ? (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Grade</label>
          <div className="flex gap-2">
            {IPHONE_GRADE_OPTIONS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setGrade(value)}
                className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  grade === value
                    ? "border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-400 dark:bg-violet-950/40 dark:text-violet-300"
                    : "border-zinc-300 dark:border-zinc-700"
                }`}
              >
                Grade {value}
              </button>
            ))}
          </div>
          <input type="hidden" name="grade" value={grade} />
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Saúde da bateria (%)</label>
        <input
          type="number"
          name="batteryHealthPct"
          min={0}
          max={100}
          value={batteryHealthPct}
          onChange={(event) => setBatteryHealthPct(event.target.value)}
          className={`${inputClass} w-28`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Aparelhos em produtos *</label>
        <div className="flex flex-col gap-3">
          {variants.map((variant, index) => (
            <div key={variant.key} className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  list="iphone-color-options"
                  placeholder="Cor"
                  required
                  value={variant.color}
                  onChange={(event) => updateVariant(variant.key, { color: event.target.value })}
                  className={`${inputClass} flex-1`}
                />
                <select
                  value={variant.storageLabel}
                  onChange={(event) => updateVariant(variant.key, { storageLabel: event.target.value })}
                  className={`${inputClass} w-28`}
                >
                  <option value="">Armazenamento</option>
                  {IPHONE_STORAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {variants.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setVariants((prev) => prev.filter((v) => v.key !== variant.key))}
                    className="px-1 text-red-600"
                    aria-label="Remover variação"
                  >
                    ×
                  </button>
                ) : null}
              </div>

              <input
                type="text"
                inputMode="decimal"
                placeholder="Preço (1500,00)"
                required
                value={variant.price}
                onChange={(event) => updateVariant(variant.key, { price: event.target.value })}
                className={inputClass}
              />

              <div>
                <p className="mb-1 text-xs text-zinc-500">Fotos desta cor (até 4)</p>
                <VariantPhotoSlots
                  images={variant.imageUrls}
                  onChange={(next) => updateVariant(variant.key, { imageUrls: next })}
                />
              </div>

              {index === 0 ? (
                <datalist id="iphone-color-options">
                  {IPHONE_COLOR_OPTIONS.map((color) => (
                    <option key={color} value={color} />
                  ))}
                </datalist>
              ) : null}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
          className="self-start text-sm text-violet-600 underline dark:text-violet-400"
        >
          + Adicionar aparelho
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Itens inclusos</label>
        <div className="flex flex-wrap gap-2">
          {IPHONE_INCLUDED_ITEM_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleIncluded(item)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                includedItems.includes(item)
                  ? "border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-400 dark:bg-violet-950/40 dark:text-violet-300"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              {item}
            </button>
          ))}
          {includedItems
            .filter((item) => !IPHONE_INCLUDED_ITEM_OPTIONS.includes(item))
            .map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleIncluded(item)}
                className="rounded-full border border-violet-500 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:border-violet-400 dark:bg-violet-950/40 dark:text-violet-300"
              >
                {item} ×
              </button>
            ))}
        </div>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            placeholder="Adicionar outro item"
            value={customItem}
            onChange={(event) => setCustomItem(event.target.value)}
            className={`${inputClass} flex-1`}
          />
          <button type="button" onClick={addCustomItem} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700">
            Adicionar
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Observações</label>
        <textarea
          name="description"
          rows={2}
          placeholder="Detalhes de uso, carcaça, tela..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="isActive" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
        Ativo (publicado na vitrine)
      </label>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-violet-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
        >
          {isPending ? "Salvando..." : submitLabel}
        </button>
        {onDone ? (
          <button type="button" onClick={onDone} className="text-sm text-zinc-500 underline">
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
