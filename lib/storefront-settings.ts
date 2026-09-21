// Shape of `stores.storefrontSettings` (jsonb) — vitrine display options
// beyond theme colors/fonts. Currently only read/written by the iphone-store
// template (trust badges, installment display, grid density), but kept
// generic enough for another template to reuse later instead of adding its
// own column.
import { z } from "zod";

export const storefrontSettingsSchema = z.object({
  badges: z
    .object({
      verified: z.boolean().default(false),
      respondsFast: z.boolean().default(false),
      readyDelivery: z.boolean().default(false),
    })
    .default({ verified: false, respondsFast: false, readyDelivery: false }),
  installments: z
    .object({
      enabled: z.boolean().default(false),
      maxInstallments: z.number().int().min(1).max(12).default(12),
      feeRatePct: z.number().min(0).max(20).default(0),
    })
    .default({ enabled: false, maxInstallments: 12, feeRatePct: 0 }),
  displayMode: z.enum(["grande", "compacto"]).default("compacto"),
});

export type StorefrontSettings = z.infer<typeof storefrontSettingsSchema>;

export const DEFAULT_STOREFRONT_SETTINGS: StorefrontSettings = {
  badges: { verified: false, respondsFast: false, readyDelivery: false },
  installments: { enabled: false, maxInstallments: 12, feeRatePct: 0 },
  displayMode: "compacto",
};

export function resolveStorefrontSettings(raw: unknown): StorefrontSettings {
  const parsed = storefrontSettingsSchema.safeParse(raw);
  return parsed.success ? parsed.data : DEFAULT_STOREFRONT_SETTINGS;
}

/** cents per unit, split across `installments` with a flat fee rate added
 * per installment count — good enough approximation for "ou 12x de R$ X"
 * display; not a real payment-processor calculation. */
export function installmentCents(priceCents: number, installments: number, feeRatePct: number): number {
  const totalCents = Math.round(priceCents * (1 + (feeRatePct / 100) * installments));
  return Math.round(totalCents / installments);
}
