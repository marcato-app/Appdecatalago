import { buildWhatsAppLink } from "@/lib/whatsapp";

export interface LinkHubStore {
  name: string;
  tagline: string | null;
  bio: string | null;
  logoUrl: string | null;
  whatsappNumber: string | null;
  instagramHandle: string | null;
  addressLine: string | null;
}

export function LinkHub({ store, catalogHref }: { store: LinkHubStore; catalogHref: string }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center bg-[var(--color-background)] px-6 py-14 text-[var(--color-ink)]">
      {store.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- store-provided URL, no upload pipeline yet (Fase 1 scope)
        <img
          src={store.logoUrl}
          alt={store.name}
          className="mb-4 h-24 w-24 rounded-full object-cover shadow-lg"
        />
      ) : null}
      <h1
        className="text-center text-3xl font-semibold"
        style={{ fontFamily: "var(--font-display, inherit)" }}
      >
        {store.name}
      </h1>
      {store.tagline ? <p className="mt-2 text-center text-[var(--color-text-dim)]">{store.tagline}</p> : null}
      {store.bio ? <p className="mt-4 text-center text-sm text-[var(--color-text-dim)]">{store.bio}</p> : null}

      <nav className="mt-10 flex w-full flex-col gap-3">
        <a
          href={catalogHref}
          className="rounded-2xl border px-5 py-4 text-center font-medium"
          style={{ borderColor: "var(--color-primary)", background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}
        >
          Ver cardápio
        </a>

        {store.whatsappNumber ? (
          <a
            href={buildWhatsAppLink(store.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-[var(--color-line)] px-5 py-4 text-center font-medium"
          >
            Falar no WhatsApp
          </a>
        ) : null}

        {store.instagramHandle ? (
          <a
            href={`https://instagram.com/${store.instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-[var(--color-line)] px-5 py-4 text-center font-medium"
          >
            Instagram · @{store.instagramHandle}
          </a>
        ) : null}

        {store.addressLine ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.addressLine)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-[var(--color-line)] px-5 py-4 text-center font-medium"
          >
            {store.addressLine}
          </a>
        ) : null}
      </nav>
    </div>
  );
}
