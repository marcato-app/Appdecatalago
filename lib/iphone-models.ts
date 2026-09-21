// Curated iPhone model list for the iphone-store template's "Modelo"
// picker, newest first (matches the order lojistas scan a supplier list
// in). Not an enum in the DB — products.name just stores whichever string
// the lojista picks or types, so a model Apple releases after this list was
// written still works (input has a free-text fallback, see IphoneProductForm).
export const IPHONE_MODELS: string[] = [
  "iPhone 17 Pro Max",
  "iPhone 17 Pro",
  "iPhone 17",
  "iPhone 17e",
  "iPhone Air",
  "iPhone 16 Pro Max",
  "iPhone 16 Pro",
  "iPhone 16 Plus",
  "iPhone 16",
  "iPhone 16e",
  "iPhone 15 Pro Max",
  "iPhone 15 Pro",
  "iPhone 15 Plus",
  "iPhone 15",
  "iPhone 14 Pro Max",
  "iPhone 14 Pro",
  "iPhone 14 Plus",
  "iPhone 14",
  "iPhone 13 Pro Max",
  "iPhone 13 Pro",
  "iPhone 13",
  "iPhone 13 mini",
  "iPhone SE (3ª geração)",
  "iPhone 12 Pro Max",
  "iPhone 12 Pro",
  "iPhone 12",
  "iPhone 12 mini",
  "iPhone SE (2ª geração)",
  "iPhone 11 Pro Max",
  "iPhone 11 Pro",
  "iPhone 11",
  "iPhone XS Max",
  "iPhone XS",
  "iPhone XR",
  "iPhone X",
];

export const IPHONE_STORAGE_OPTIONS: string[] = ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"];

export const IPHONE_COLOR_OPTIONS: string[] = ["Preto", "Branco", "Azul", "Vermelho", "Amarelo", "Roxo", "Verde", "Rosa", "Dourado", "Grafite"];

export const IPHONE_CONDITION_LABELS: Record<"lacrado" | "seminovo" | "cpo", string> = {
  lacrado: "Lacrado",
  seminovo: "Semi novo",
  cpo: "CPO",
};

export const IPHONE_GRADE_OPTIONS: string[] = ["A", "AB", "B"];

export const IPHONE_INCLUDED_ITEM_OPTIONS: string[] = ["Caixa", "Cabo", "Fonte", "Capinha", "Película", "Fone"];
