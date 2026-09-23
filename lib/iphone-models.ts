// Curated iPhone model list for the iphone-store template's "Modelo"
// picker, newest first (matches the order lojistas scan a supplier list
// in). Not an enum in the DB — products.name just stores whichever string
// the lojista picks or types, so a model Apple releases after this list was
// written still works (input has a free-text fallback, see IphoneProductForm).
export const IPHONE_MODELS: string[] = [
  "iPhone Duo",
  "iPhone 18 Pro Max",
  "iPhone 18 Pro",
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

// Fotos por variação (cor/capacidade): frente, traseira, ângulo, lateral,
// dupla — o shot list padrão de renders de produto. jsonb, sem limite de
// schema; só a validação da action e o formulário respeitam este teto.
export const MAX_VARIANT_PHOTOS = 5;

// A "linha de produto" (db/schema.ts productLine) — a loja vende a linha
// Apple inteira, não só iPhone. iPhone continua sendo o default de toda
// loja/produto criado antes dessa coluna existir.
export type ProductLine = "iphone" | "watch" | "airpods" | "ipad" | "mac";

export const PRODUCT_LINE_LABELS: Record<ProductLine, string> = {
  iphone: "iPhone",
  watch: "Apple Watch",
  airpods: "AirPods",
  ipad: "iPad",
  mac: "Mac",
};

export const PRODUCT_LINE_ORDER: ProductLine[] = ["iphone", "watch", "airpods", "ipad", "mac"];

// O rótulo do campo de capacidade/tamanho muda por linha — Watch tem
// tamanho de caixa (não armazenamento), AirPods não tem variação nenhuma
// nesse campo (fica escondido no formulário e vazio no catálogo).
export const PRODUCT_LINE_STORAGE_LABELS: Record<ProductLine, string | null> = {
  iphone: "Armazenamento",
  watch: "Tamanho",
  airpods: null,
  ipad: "Armazenamento",
  mac: "Armazenamento",
};

export const WATCH_SIZE_OPTIONS: string[] = ["38mm", "40mm", "41mm", "42mm", "44mm", "45mm", "46mm", "49mm"];

export function storageOptionsForLine(line: ProductLine): string[] {
  return line === "watch" ? WATCH_SIZE_OPTIONS : IPHONE_STORAGE_OPTIONS;
}
