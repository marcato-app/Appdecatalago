"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCentsToBRL } from "@/lib/money";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { installmentCents, type StorefrontSettings } from "@/lib/storefront-settings";
import { colorSwatch } from "@/lib/iphone-colors";
import { IPHONE_CONDITION_LABELS } from "@/lib/iphone-models";
import { PhotoCarousel } from "./PhotoCarousel";
import { ChevronLeftIcon } from "./icons";
import styles from "./ProductDetail.module.css";
import type { IphoneProductDto, IphoneStoreInfo } from "./types";

export function ProductDetail({
  store,
  product,
  settings,
}: {
  store: IphoneStoreInfo;
  product: IphoneProductDto;
  settings: StorefrontSettings;
}) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0],
    [product.variants, selectedVariantId],
  );

  if (!selectedVariant) return null;

  const installmentLine = settings.installments.enabled
    ? `Ou em até ${settings.installments.maxInstallments}x de ${formatCentsToBRL(
        installmentCents(selectedVariant.priceCents, settings.installments.maxInstallments, settings.installments.feeRatePct),
      )} no cartão`
    : null;

  const canSendLead = name.trim().length > 0 && phone.trim().length > 0;

  const leadMessage = [
    `Olá! Tenho interesse no ${product.name}${selectedVariant.storageLabel ? ` ${selectedVariant.storageLabel}` : ""} (${selectedVariant.color}).`,
    `Valor: ${formatCentsToBRL(selectedVariant.priceCents)}`,
    "",
    `Nome: ${name}`,
    city ? `Cidade: ${city}` : null,
    `WhatsApp para retorno: ${phone}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const whatsappHref = store.whatsappNumber ? buildWhatsAppLink(store.whatsappNumber, leadMessage) : null;

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.topBar}>
          <Link href={`/${store.slug}`} className={styles.backLink} aria-label="Voltar">
            <ChevronLeftIcon />
          </Link>
          <div>
            <p className={styles.topBarName}>{store.name}</p>
            {store.tagline ? <p className={styles.topBarTagline}>{store.tagline}</p> : null}
          </div>
        </div>

        <div className={styles.gallery}>
          <PhotoCarousel images={selectedVariant.imageUrls} alt={`${product.name} ${selectedVariant.color}`} />
        </div>

        {product.variants.length > 1 ? (
          <div className={styles.variantThumbs}>
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                className={`${styles.variantThumb} ${variant.id === selectedVariant.id ? styles.variantThumbActive : ""}`}
                style={{ background: variant.imageUrls[0] ? undefined : colorSwatch(variant.color) }}
                aria-label={`${variant.color}${variant.storageLabel ? ` ${variant.storageLabel}` : ""}`}
                title={`${variant.color}${variant.storageLabel ? ` ${variant.storageLabel}` : ""}`}
              >
                {variant.imageUrls[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- uploaded via R2
                  <img src={variant.imageUrls[0]} alt="" />
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        <div className={styles.body}>
          <div className={styles.badgeRow}>
            {product.condition ? <span className={styles.conditionBadge}>{IPHONE_CONDITION_LABELS[product.condition]}</span> : null}
            {product.grade ? <span className={styles.metaText}>Grade {product.grade}</span> : null}
            {product.batteryHealthPct !== null ? <span className={styles.metaText}>Bateria {product.batteryHealthPct}%</span> : null}
          </div>

          <h1 className={styles.title}>
            {product.name}
            {selectedVariant.storageLabel ? ` ${selectedVariant.storageLabel}` : ""}
          </h1>
          <p className={styles.metaText}>{selectedVariant.color}</p>

          {product.includedItems.length > 0 ? (
            <div className={styles.includedRow}>
              <span className={styles.includedLabel}>Incluso:</span>
              {product.includedItems.map((item) => (
                <span key={item} className={styles.chip}>
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          <div className={styles.priceBlock}>
            <p className={styles.priceLabel}>À vista</p>
            <p className={styles.priceValue}>{formatCentsToBRL(selectedVariant.priceCents)}</p>
            {installmentLine ? <p className={styles.installmentLine}>{installmentLine}</p> : null}
          </div>

          {product.description ? <p className={styles.description}>{product.description}</p> : null}

          <div className={styles.leadForm}>
            <p className={styles.leadFormTitle}>Confirme seus dados para reservar e finalizar o atendimento no WhatsApp.</p>
            <input
              type="text"
              placeholder="Ex: João da Silva"
              className={styles.leadInput}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              type="text"
              placeholder="Ex: São Paulo - SP"
              className={styles.leadInput}
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
            <input
              type="tel"
              placeholder="Ex: (11) 99999-9999"
              className={styles.leadInput}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            {whatsappHref ? (
              <a
                href={canSendLead ? whatsappHref : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.ctaButton} ${canSendLead ? "" : styles.ctaButtonDisabled}`}
                aria-disabled={!canSendLead}
              >
                Tenho interesse — abrir WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
