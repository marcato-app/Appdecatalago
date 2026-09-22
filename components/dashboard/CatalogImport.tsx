"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importCatalogModelsAction } from "@/app/dashboard/(painel)/loja/produtos/catalog-actions";
import { showToast } from "@/lib/toast";
import { IPHONE_CONDITION_LABELS, IPHONE_GRADE_OPTIONS, IPHONE_INCLUDED_ITEM_OPTIONS } from "@/lib/iphone-models";

type Condition = "lacrado" | "seminovo" | "cpo";

export interface CatalogImportModel {
  id: string;
  name: string;
  colors: string[];
  storages: string[];
  /** "nome::condição" já cadastrados — só pra avisar, não bloqueia. */
  alreadyIn: Condition[];
}

/** Estado por modelo: preço digitado por capacidade e cores desmarcadas. */
type ModelDraft = { prices: Record<string, string>; excludedColors: string[] };

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400 dark:bg-transparent";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function CatalogImport({ models }: { models: CatalogImportModel[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [condition, setCondition] = useState<Condition>("lacrado");
  const [grade, setGrade] = useState("A");
  const [battery, setBattery] = useState("100");
  const [includedItems, setIncludedItems] = useState<string[]>(["Caixa", "Cabo"]);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, ModelDraft>>({});

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return models;
    return models.filter((model) => normalize(model.name).includes(q));
  }, [models, query]);

  function draftOf(id: string): ModelDraft {
    return drafts[id] ?? { prices: {}, excludedColors: [] };
  }

  function setPrice(modelId: string, storage: string, value: string) {
    setDrafts((prev) => {
      const draft = prev[modelId] ?? { prices: {}, excludedColors: [] };
      return { ...prev, [modelId]: { ...draft, prices: { ...draft.prices, [storage]: value } } };
    });
  }

  function toggleColor(modelId: string, color: string) {
    setDrafts((prev) => {
      const draft = prev[modelId] ?? { prices: {}, excludedColors: [] };
      const excluded = draft.excludedColors.includes(color)
        ? draft.excludedColors.filter((c) => c !== color)
        : [...draft.excludedColors, color];
      return { ...prev, [modelId]: { ...draft, excludedColors: excluded } };
    });
  }

  /** "Mesmo preço pra todas as capacidades" — o caso mais comum de quem só
   * revende lacrado de uma capacidade só é digitar um número e pronto. */
  function fillAll(model: CatalogImportModel, value: string) {
    setDrafts((prev) => {
      const draft = prev[model.id] ?? { prices: {}, excludedColors: [] };
      const prices = { ...draft.prices };
      for (const storage of model.storages) prices[storage] = value;
      return { ...prev, [model.id]: { ...draft, prices } };
    });
  }

  function clearModel(modelId: string) {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[modelId];
      return next;
    });
  }

  const selection = useMemo(() => {
    const entries: { id: string; colors: string[]; prices: Record<string, string> }[] = [];
    let variantCount = 0;

    for (const model of models) {
      const draft = drafts[model.id];
      if (!draft) continue;
      const pricedStorages = model.storages.filter((storage) => (draft.prices[storage] ?? "").trim() !== "");
      if (pricedStorages.length === 0) continue;
      const colors = model.colors.filter((color) => !draft.excludedColors.includes(color));
      if (colors.length === 0) continue;

      variantCount += pricedStorages.length * colors.length;
      entries.push({
        id: model.id,
        colors,
        prices: Object.fromEntries(pricedStorages.map((storage) => [storage, draft.prices[storage].trim()])),
      });
    }

    return { entries, variantCount };
  }, [models, drafts]);

  function submit() {
    if (selection.entries.length === 0) return;
    startTransition(async () => {
      const result = await importCatalogModelsAction({
        condition,
        grade,
        batteryHealthPct: condition === "lacrado" ? 100 : Number(battery) || null,
        includedItems,
        models: selection.entries,
      });

      if (result.error) {
        showToast(result.error, true);
        return;
      }
      showToast(`${result.imported} ${result.imported === 1 ? "aparelho adicionado" : "aparelhos adicionados"} à loja`);
      router.push("/dashboard/loja/produtos");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5 pb-28">
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <p className="text-sm font-medium">Condição destes aparelhos</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Vale pra todos os modelos desta importação. Pra cadastrar o mesmo modelo em outra condição, é só importar de
            novo depois.
          </p>
        </div>
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

        {condition === "seminovo" ? (
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-500">Grade</label>
              <div className="flex gap-2">
                {IPHONE_GRADE_OPTIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setGrade(value)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      grade === value
                        ? "border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-400 dark:bg-violet-950/40 dark:text-violet-300"
                        : "border-zinc-300 dark:border-zinc-700"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-500">Bateria (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={battery}
                onChange={(event) => setBattery(event.target.value)}
                className={`${inputClass} w-24`}
              />
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">Itens inclusos</label>
          <div className="flex flex-wrap gap-2">
            {IPHONE_INCLUDED_ITEM_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setIncludedItems((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
                }
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  includedItems.includes(item)
                    ? "border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-400 dark:bg-violet-950/40 dark:text-violet-300"
                    : "border-zinc-300 dark:border-zinc-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar modelo (ex: 15 Pro)"
        className={`${inputClass} w-full`}
      />

      <div className="flex flex-col gap-2">
        {visible.map((model) => {
          const draft = draftOf(model.id);
          const priced = model.storages.filter((storage) => (draft.prices[storage] ?? "").trim() !== "");
          const isOpen = expanded === model.id;
          const activeColors = model.colors.filter((color) => !draft.excludedColors.includes(color));

          return (
            <div
              key={model.id}
              className={`rounded-2xl border bg-white transition-colors dark:bg-zinc-900 ${
                priced.length > 0
                  ? "border-violet-400 dark:border-violet-500"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : model.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{model.name}</p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {model.storages.join(" · ")} — {model.colors.length} cores
                    {model.alreadyIn.includes(condition) ? " · já na loja" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {priced.length > 0 ? (
                    <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white">
                      {priced.length * activeColors.length}
                    </span>
                  ) : null}
                  <span aria-hidden="true" className="text-zinc-400">
                    {isOpen ? "▾" : "▸"}
                  </span>
                </div>
              </button>

              {isOpen ? (
                <div className="flex flex-col gap-3 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-zinc-500">
                      Preço por capacidade — deixe em branco as que você não vende
                    </p>
                    {model.storages.map((storage) => (
                      <div key={storage} className="flex items-center gap-2">
                        <span className="w-20 shrink-0 text-sm text-zinc-500">{storage}</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="4500,00"
                          value={draft.prices[storage] ?? ""}
                          onChange={(event) => setPrice(model.id, storage, event.target.value)}
                          className={`${inputClass} flex-1`}
                        />
                      </div>
                    ))}
                    {model.storages.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => fillAll(model, draft.prices[model.storages[0]] ?? "")}
                        className="self-start text-xs text-violet-600 underline dark:text-violet-400"
                      >
                        Repetir o preço da primeira em todas
                      </button>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium text-zinc-500">Cores que você tem</p>
                    <div className="flex flex-wrap gap-1.5">
                      {model.colors.map((color) => {
                        const on = !draft.excludedColors.includes(color);
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => toggleColor(model.id, color)}
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                              on
                                ? "border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-400 dark:bg-violet-950/40 dark:text-violet-300"
                                : "border-zinc-300 text-zinc-400 line-through dark:border-zinc-700"
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {priced.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => clearModel(model.id)}
                      className="self-start text-xs text-red-600 underline"
                    >
                      Limpar este modelo
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}

        {visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
            Nenhum modelo com esse nome.
          </p>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-6 py-3">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {selection.entries.length === 0
              ? "Ponha o preço de pelo menos um modelo"
              : `${selection.entries.length} ${selection.entries.length === 1 ? "modelo" : "modelos"} · ${selection.variantCount} variações`}
          </p>
          <button
            type="button"
            onClick={submit}
            disabled={isPending || selection.entries.length === 0}
            className="shrink-0 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
          >
            {isPending ? "Adicionando..." : "Adicionar à loja"}
          </button>
        </div>
      </div>
    </div>
  );
}
