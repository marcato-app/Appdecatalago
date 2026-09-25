// Interpreta uma lista de preços colada em texto livre — o formato clássico
// de catálogo de fornecedor no WhatsApp/Instagram: emoji + MODELO CAPACIDADE
// [- CONDIÇÃO], linhas de cor com emoji (às vezes com um preço específico no
// fim), e uma linha 💵 com o preço base do bloco — e casa cada bloco contra
// o catálogo global, pra pré-preencher a importação em lote em vez de
// digitar preço por preço.
//
// Escopo: só iPhone (📱) e Apple Watch (⌚) — é onde o formato é regular o
// bastante pra extrair modelo/capacidade com confiança. AirPods/iPad/Mac e
// acessórios continuam entrando pelo fluxo manual de sempre.
//
// Usa só o preço BASE (linha 💵) por modelo+capacidade — se uma cor
// específica custa mais na lista do fornecedor (comum: "STARLIGHT 4.380"
// numa linha, preço base "4.350" na linha seguinte), isso não é
// representado aqui, porque a tela de importação em lote só tem um preço
// por capacidade, igual pra todas as cores da capacidade. O lojista ajusta
// essa cor à mão depois se precisar.
//
// Puro de propósito — sem DOM, sem rede — pra poder testar isolado e rodar
// direto no navegador a partir do textarea de colar.

import type { CatalogImportModel } from "@/components/dashboard/CatalogImport";

export type ParsedCondition = "lacrado" | "seminovo" | "cpo";

export interface ParsedPriceBlock {
  rawHeader: string;
  modelText: string;
  sizeText: string | null; // "128GB", "44MM" — como veio, maiúsculo
  condition: ParsedCondition;
  colors: string[]; // texto cru de cada linha de cor do bloco
  basePriceCents: number | null;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function stripLeadingEmoji(line: string): string {
  return line.replace(/^[^\p{L}\p{N}]+/u, "").trim();
}

// "4.380" -> 438000 centavos; "12,50" -> 1250; aceita "R$" e espaços no meio.
function parsePriceToCents(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.,]/g, "");
  if (!cleaned) return null;
  const hasComma = cleaned.includes(",");
  const dotParts = cleaned.split(".");
  const looksLikeDecimalDot = !hasComma && dotParts.length === 2 && dotParts[1].length === 2;
  const normalized = hasComma
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : looksLikeDecimalDot
      ? cleaned
      : cleaned.replace(/\./g, ""); // "2.880" é separador de milhar, não decimal
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}

const CONDITION_KEYWORDS: { pattern: RegExp; condition: ParsedCondition }[] = [
  { pattern: /\bcpo\b/i, condition: "cpo" },
  { pattern: /\b(swap|seminovo|nunca ativado|n[aã]o ativado)\b/i, condition: "seminovo" },
  { pattern: /\b(lacrado|anatel|garantia apple)\b/i, condition: "lacrado" },
];

function detectCondition(text: string, fallback: ParsedCondition): ParsedCondition {
  for (const { pattern, condition } of CONDITION_KEYWORDS) {
    if (pattern.test(text)) return condition;
  }
  return fallback;
}

/** Interpreta o texto colado em blocos — um por linha de cabeçalho (📱/⌚
 * com capacidade/tamanho junto). Não depende do catálogo: só estrutura o
 * texto. */
export function parsePriceList(text: string): ParsedPriceBlock[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const blocks: ParsedPriceBlock[] = [];

  let sectionCondition: ParsedCondition = "lacrado";
  let current: Omit<ParsedPriceBlock, "basePriceCents"> | null = null;

  function flush(basePriceCents: number | null) {
    if (!current) return;
    blocks.push({ ...current, basePriceCents });
    current = null;
  }

  for (const line of lines) {
    if (!line) continue;

    // Linha de preço (💵) sempre fecha o bloco em aberto — tem prioridade
    // sobre qualquer outra classificação.
    if (/💵/.test(line)) {
      const priceMatch = line.match(/[\d.,]+/);
      flush(priceMatch ? parsePriceToCents(priceMatch[0]) : null);
      continue;
    }

    const isProductOrWatchEmoji = /📱|⌚/.test(line);
    const sizeMatch = line.match(/(\d+)\s*(gb|tb|mm)\b/i);

    // Cabeçalho de produto/relógio de verdade: emoji certo + capacidade ou
    // tamanho na própria linha.
    if (isProductOrWatchEmoji && sizeMatch) {
      flush(null); // bloco anterior nunca teve linha 💵 — fica sem preço
      const withoutEmoji = stripLeadingEmoji(line);
      const sizeInLine = withoutEmoji.match(/(\d+)\s*(gb|tb|mm)/i)!;
      const sizeText = `${sizeInLine[1]}${sizeInLine[2].toUpperCase()}`;
      const modelText = withoutEmoji
        .slice(0, sizeInLine.index)
        .replace(/[-–—]\s*$/, "")
        .trim();
      const afterSize = withoutEmoji.slice(sizeInLine.index! + sizeInLine[0].length);
      const condition = detectCondition(afterSize, sectionCondition);
      current = { rawHeader: line, modelText, sizeText, condition, colors: [] };
      continue;
    }

    // Cabeçalho de seção ("🔒 LACRADO...", "📱 IPHONE SWAP – GARANTIA 1 MÊS
    // (SEMINOVO)...") muda a condição padrão dos blocos seguintes — só conta
    // como isso quando não há bloco de produto em aberto (senão uma linha
    // de cor chamada só "Preto" nunca bateria com essas palavras mesmo).
    if (!current && (/lacrado/i.test(line) || /swap/i.test(line))) {
      sectionCondition = /lacrado/i.test(line) ? "lacrado" : "seminovo";
      continue;
    }

    // Sobrou: linha de cor do bloco em aberto, ou ruído (divisor "⸻",
    // título de seção tipo "⌚️ APPLE WATCH") que é só ignorado.
    if (current) {
      const withoutEmoji = stripLeadingEmoji(line);
      const priceAtEnd = withoutEmoji.match(/([\d.,]+)\s*$/);
      const colorName = (priceAtEnd ? withoutEmoji.slice(0, priceAtEnd.index) : withoutEmoji).trim();
      if (colorName) current.colors.push(colorName);
    }
  }
  flush(null);

  return blocks;
}

const COLOR_SYNONYMS: Record<string, string> = {
  graphite: "grafite",
  silver: "prateado",
  midnight: "meianoite",
  starlight: "estelar",
  green: "verde",
  black: "preto",
  blue: "azul",
  purple: "roxo",
  pink: "rosa",
  gold: "dourado",
  teal: "verdecisneteal",
  ultramarine: "ultramarino",
  whitetitanium: "titaniobranco",
  blacktitanium: "titaniopreto",
  naturaltitanium: "titanionatural",
  deserttitanium: "titaniodeserto",
  desert: "titaniodeserto",
  white: "branco",
  cosmicorange: "laranjacosmico",
  deepblue: "azulprofundo",
  glacial: "glacial",
  burgundy: "bordo",
  rosegold: "rose",
  orange: "laranja",
  yellow: "amarelo",
  red: "vermelho",
  spacegrey: "cinzaespacial",
  spacegray: "cinzaespacial",
  jetblack: "preto",
  spaceblack: "preto",
};

function normalizeColorForMatch(raw: string): string {
  const norm = normalize(raw);
  return COLOR_SYNONYMS[norm] ?? norm;
}

/** "SE 3ª Geração", "S10", "ULTRA 3" -> "Apple Watch SE", "Apple Watch
 * Series 10", "Apple Watch Ultra 3" — o texto de modelo do Watch na lista
 * nunca vem com "Apple Watch" na frente, e às vezes abrevia "Series" como
 * "S". Modelo que não existir no catálogo (ex: Series 11, Ultra 3, que
 * ainda não escrevemos) fica sem correspondência — é sinal real de gap de
 * catálogo, não bug do parser. */
function normalizeWatchModelText(modelText: string): string {
  let text = modelText.replace(/\d+[°ªº]?\s*gera[cç][aã]o/i, "").trim();
  text = text.replace(/^s(\d+)$/i, "series $1");
  if (!/apple\s*watch/i.test(text)) text = `Apple Watch ${text}`;
  return text;
}

export interface MatchedPriceEntry {
  block: ParsedPriceBlock;
  model: CatalogImportModel;
  storage: string; // rótulo exato do catálogo
  colors: string[]; // cores do catálogo que bateram (todas, se a lista não citou nenhuma reconhecível)
  priceCents: number;
}

export interface UnmatchedPriceEntry {
  block: ParsedPriceBlock;
  reason: "modelo não encontrado no catálogo" | "capacidade/tamanho não encontrado" | "sem preço na lista";
}

export interface PriceListMatchResult {
  matched: MatchedPriceEntry[];
  unmatched: UnmatchedPriceEntry[];
  /** Blocos de uma condição diferente da aba selecionada — não é erro, só
   * não é a passada atual (o lojista troca a aba de condição e cola de novo). */
  otherConditionCount: number;
}

export function matchPriceListToCatalog(
  blocks: ParsedPriceBlock[],
  models: CatalogImportModel[],
  activeCondition: ParsedCondition,
): PriceListMatchResult {
  const matched: MatchedPriceEntry[] = [];
  const unmatched: UnmatchedPriceEntry[] = [];
  let otherConditionCount = 0;

  for (const block of blocks) {
    if (block.condition !== activeCondition) {
      otherConditionCount++;
      continue;
    }

    const isWatch = /⌚/.test(block.rawHeader);
    const key = normalize(isWatch ? normalizeWatchModelText(block.modelText) : block.modelText);
    const model = models.find((m) => normalize(m.name) === key);
    if (!model) {
      unmatched.push({ block, reason: "modelo não encontrado no catálogo" });
      continue;
    }

    const storage = block.sizeText
      ? model.storages.find((s) => s.toUpperCase() === block.sizeText!.toUpperCase())
      : model.storages[0];
    if (!storage) {
      unmatched.push({ block, reason: "capacidade/tamanho não encontrado" });
      continue;
    }

    if (block.basePriceCents === null) {
      unmatched.push({ block, reason: "sem preço na lista" });
      continue;
    }

    const matchedColors = [
      ...new Set(
        block.colors
          .map((c) => normalizeColorForMatch(c))
          .map((normColor) => model.colors.find((mc) => normalize(mc) === normColor))
          .filter((c): c is string => Boolean(c)),
      ),
    ];

    matched.push({
      block,
      model,
      storage,
      colors: matchedColors.length > 0 ? matchedColors : model.colors,
      priceCents: block.basePriceCents,
    });
  }

  return { matched, unmatched, otherConditionCount };
}

export function centsToPriceInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}
