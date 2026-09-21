export function formatCentsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Parses a price typed as "12,50" or "12.50" into integer cents. Returns
 * null when the input isn't a valid non-negative number. */
export function parseBRLToCents(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let normalized = trimmed.replace(/[^\d,.-]/g, "");
  if (normalized.includes(",")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  }

  // Number("") is 0 in JS, not NaN — without this, a price with no digits
  // at all (e.g. someone typed only letters/symbols) would silently become
  // R$ 0,00 instead of being rejected.
  if (!/\d/.test(normalized)) return null;

  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}
