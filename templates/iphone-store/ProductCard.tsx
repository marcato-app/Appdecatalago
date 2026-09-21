import Link from "next/link";
import { formatCentsToBRL } from "@/lib/money";
import { installmentCents, type StorefrontSettings } from "@/lib/storefront-settings";
import { colorSwatch } from "@/lib/iphone-colors";
import { IPHONE_CONDITION_LABELS } from "@/lib/iphone-models";
import { PhotoCarousel } from "./PhotoCarousel";
import styles from "./Storefront.module.css";
import type { IphoneProductDto } from "./types";

export function ProductCard({
  product,
  storeSlug,
  settings,
}: {
  product: IphoneProductDto;
  storeSlug: string;
  settings: StorefrontSettings;
}) {
  const variants = product.variants;
  if (variants.length === 0) return null;

  const cheapest = variants.reduce((min, v) => (v.priceCents < min.priceCents ? v : min), variants[0]);
  const distinctColors = Array.from(new Set(variants.map((v) => v.color)));
  const metaLabel =
    variants.length === 1 ? [variants[0].storageLabel, "1 cor"].filter(Boolean).join(" · ") : `${variants.length} opções`;

  return (
    <div className={styles.card}>
      <div className={styles.cardPhoto}>
        <PhotoCarousel images={cheapest.imageUrls} alt={product.name} />
      </div>
      <div className={styles.cardBody}>
        {product.condition ? <span className={styles.conditionBadge}>{IPHONE_CONDITION_LABELS[product.condition]}</span> : null}
        <h3 className={styles.cardName}>{product.name}</h3>
        <p className={styles.cardMeta}>{metaLabel}</p>

        <div>
          <p className={styles.priceLabel}>A partir de</p>
          <p className={styles.priceValue}>{formatCentsToBRL(cheapest.priceCents)}</p>
          {settings.installments.enabled ? (
            <p className={styles.installmentValue}>
              ou {settings.installments.maxInstallments}x de{" "}
              {formatCentsToBRL(installmentCents(cheapest.priceCents, settings.installments.maxInstallments, settings.installments.feeRatePct))}
            </p>
          ) : null}
        </div>

        {distinctColors.length > 1 ? (
          <div className={styles.colorDots}>
            {distinctColors.slice(0, 6).map((color) => (
              <span key={color} className={styles.colorDot} style={{ background: colorSwatch(color) }} title={color} />
            ))}
          </div>
        ) : null}

        <Link href={`/${storeSlug}/produto/${product.id}`} className={styles.detailButton}>
          Ver detalhes
        </Link>
      </div>
    </div>
  );
}
