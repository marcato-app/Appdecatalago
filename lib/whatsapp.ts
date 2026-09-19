// Shared "checkout" building blocks, ported from
// references/modelos/adega-mm/assets/js/script.js (buildWhatsAppMessage).

import { formatCentsToBRL } from "./money";

// wa.me links need the full international number. Lojistas are asked for
// just DDD + number (see the "WhatsApp (com DDD)" field), so a bare 10/11
// digit Brazilian number gets the 55 country code prepended; anything else
// (already has a country code, or is unusually short/long) passes through.
export function normalizeWhatsAppNumber(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

export function buildWhatsAppLink(number: string, message?: string): string {
  const digits = normalizeWhatsAppNumber(number);
  if (!message) return `https://wa.me/${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export interface OrderLine {
  name: string;
  unitLabel?: string | null;
  quantity: number;
  priceCents: number;
}

export function buildOrderMessage(storeName: string, lines: OrderLine[]): string {
  const itemLines = lines.map((line) => {
    const label = line.unitLabel ? `${line.name} ${line.unitLabel}` : line.name;
    const subtotalCents = line.priceCents * line.quantity;
    return `${line.quantity}x ${label} — ${formatCentsToBRL(subtotalCents)}`;
  });
  const totalCents = lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);

  return [
    `Olá! Quero fazer um pedido na ${storeName}:`,
    "",
    ...itemLines,
    "",
    `Total: ${formatCentsToBRL(totalCents)}`,
  ].join("\n");
}
