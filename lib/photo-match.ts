// Casa a estrutura de pastas Modelo/Cor/foto.jpg (como o Explorar do iPhone
// exporta, ou qualquer app de arquivos) com os aparelhos já cadastrados na
// loja, pra importar fotos em massa sem clicar variação por variação.
//
// Puro de propósito (sem DOM, sem rede) — o componente lê os arquivos
// selecionados e chama isto direto no navegador; o único papel do servidor
// aqui é entregar os "alvos" (produtos/variações da loja) e, depois de
// confirmado, subir os arquivos e salvar as URLs.

export type MatchTargetVariant = {
  id: string;
  color: string;
  storageLabel: string | null;
  photoCount: number;
};

export type MatchTargetProduct = {
  id: string;
  name: string;
  condition: "lacrado" | "seminovo" | "cpo" | null;
  variants: MatchTargetVariant[];
};

/** Um grupo de arquivos que vieram da mesma pasta "Modelo/Cor". */
export type FolderPhotoGroup = {
  modelFolder: string;
  colorFolder: string;
  fileCount: number;
};

export type MatchedVariant = {
  variantId: string;
  productId: string;
  productName: string;
  productCondition: "lacrado" | "seminovo" | "cpo" | null;
  variantLabel: string; // "128GB · Preto"
};

export type MatchResult = FolderPhotoGroup & {
  /** Uma pasta "Modelo/Cor" pode bater com mais de uma variação — cada
   * capacidade daquela cor recebe o mesmo conjunto de fotos — e, se o
   * mesmo modelo existe em mais de uma condição (lacrado e semi novo, por
   * exemplo), com variações dos dois. */
  matches: MatchedVariant[];
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findProducts(modelFolder: string, products: MatchTargetProduct[]): MatchTargetProduct[] {
  const norm = normalize(modelFolder);
  if (!norm) return [];

  const exact = products.filter((p) => normalize(p.name) === norm);
  if (exact.length > 0) return exact;

  return products.filter((p) => {
    const productNorm = normalize(p.name);
    return productNorm.includes(norm) || norm.includes(productNorm);
  });
}

function findVariants(colorFolder: string, product: MatchTargetProduct): MatchTargetVariant[] {
  const norm = normalize(colorFolder);
  if (!norm) return [];

  const exact = product.variants.filter((v) => normalize(v.color) === norm);
  if (exact.length > 0) return exact;

  return product.variants.filter((v) => {
    const colorNorm = normalize(v.color);
    return colorNorm.includes(norm) || norm.includes(colorNorm);
  });
}

export function matchFolderGroups(groups: FolderPhotoGroup[], products: MatchTargetProduct[]): MatchResult[] {
  return groups.map((group) => {
    const matchedProducts = findProducts(group.modelFolder, products);
    const matches: MatchedVariant[] = matchedProducts.flatMap((product) =>
      findVariants(group.colorFolder, product).map((variant) => ({
        variantId: variant.id,
        productId: product.id,
        productName: product.name,
        productCondition: product.condition,
        variantLabel: [variant.storageLabel, variant.color].filter(Boolean).join(" · "),
      })),
    );

    return { ...group, matches };
  });
}

/** Extrai (pasta do modelo, pasta da cor) do caminho relativo que o
 * navegador dá pra cada arquivo de uma pasta selecionada
 * (`webkitRelativePath`, ex: "iPhone/iPhone 15 Pro Max/Titânio Natural/1_frente.png").
 * Usa sempre as DUAS últimas pastas antes do arquivo — assim funciona tanto
 * selecionando a pasta "iPhone" quanto uma pasta mãe que contenha ela, sem
 * exigir que a estrutura acima do modelo seja exatamente uma coisa. */
export function parseRelativePath(relativePath: string): { modelFolder: string; colorFolder: string } | null {
  const parts = relativePath.split("/").filter(Boolean);
  if (parts.length < 3) return null; // precisa de .../Modelo/Cor/arquivo
  const colorFolder = parts[parts.length - 2];
  const modelFolder = parts[parts.length - 3];
  return { modelFolder, colorFolder };
}

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

export function isImageFileName(name: string): boolean {
  const lower = name.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
