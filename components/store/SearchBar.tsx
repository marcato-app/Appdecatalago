"use client";

export function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Buscar produtos…"
      className="w-full rounded-full border border-[var(--color-line)] bg-transparent px-4 py-2.5 text-sm outline-none"
      style={{ color: "var(--color-ink)" }}
    />
  );
}
