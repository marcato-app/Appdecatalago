export type IphoneCondition = "lacrado" | "seminovo" | "cpo";

export interface IphoneVariantDto {
  id: string;
  color: string;
  storageLabel: string | null;
  priceCents: number;
  imageUrls: string[];
}

export interface IphoneProductDto {
  id: string;
  name: string;
  condition: IphoneCondition | null;
  grade: string | null;
  batteryHealthPct: number | null;
  description: string | null;
  includedItems: string[];
  variants: IphoneVariantDto[];
}

export interface IphoneStoreInfo {
  slug: string;
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  instagramHandle: string | null;
  whatsappNumber: string | null;
}
