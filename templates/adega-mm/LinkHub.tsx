import { buildWhatsAppLink, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import styles from "./LinkHub.module.css";
import { MapEmbed } from "./MapEmbed";
import { ChevronIcon, GlobeIcon, InstagramIcon, MenuIcon, StoreLinkIcon, WhatsAppIcon } from "./icons";

// Faithful port of references/modelos/adega-mm/index.html (the link-in-bio
// hub page): same lockup/nav-card structure and reveal animation, restyled
// through the theme custom properties instead of the original's fixed hex
// values. Content is per-store instead of hardcoded, and cards only render
// for channels the store actually filled in.

export interface LinkHubExtraLink {
  id: string;
  label: string;
  url: string;
  type: "website" | "app_store" | "play_store" | "custom";
}

export interface LinkHubStore {
  name: string;
  subMark: string | null;
  tagline: string | null;
  logoUrl: string | null;
  whatsappNumber: string | null;
  instagramHandle: string | null;
  addressLine: string | null;
  links: LinkHubExtraLink[];
}

function extraLinkIcon(type: LinkHubExtraLink["type"]) {
  switch (type) {
    case "website":
      return <GlobeIcon />;
    case "app_store":
    case "play_store":
      return <StoreLinkIcon />;
    default:
      return <GlobeIcon />;
  }
}

export function LinkHub({ store, catalogHref, catalogLabel, catalogMeta }: {
  store: LinkHubStore;
  catalogHref: string;
  catalogLabel: string;
  catalogMeta: string;
}) {
  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <header className={`${styles.lockup} ${styles.reveal}`}>
          {store.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- store-provided URL, no upload pipeline yet
            <img src={store.logoUrl} alt={store.name} />
          ) : null}
          <h1 className={styles.wordmark}>{store.name}</h1>
          {store.subMark ? <p className={styles.subMark}>{store.subMark}</p> : null}
          <hr className={styles.rule} />
          {store.tagline ? <p className={styles.tagline}>{store.tagline}</p> : null}
        </header>

        <nav className={styles.nav}>
          <a className={`${styles.card} ${styles.primary} ${styles.reveal}`} href={catalogHref}>
            <span className={styles.icon} aria-hidden="true">
              <MenuIcon />
            </span>
            <span className={styles.body}>
              <span className={styles.label}>{catalogLabel}</span>
              <span className={styles.meta}>{catalogMeta}</span>
            </span>
            <span className={styles.chev} aria-hidden="true">
              <ChevronIcon />
            </span>
          </a>

          {store.whatsappNumber ? (
            <a
              className={`${styles.card} ${styles.reveal}`}
              href={buildWhatsAppLink(store.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.icon} aria-hidden="true">
                <WhatsAppIcon />
              </span>
              <span className={styles.body}>
                <span className={styles.label}>Fazer pedido</span>
                <span className={styles.meta}>Chame no WhatsApp: {formatPhoneLabel(store.whatsappNumber)}</span>
              </span>
              <span className={styles.chev} aria-hidden="true">
                <ChevronIcon />
              </span>
            </a>
          ) : null}

          {store.addressLine ? (
            <a
              className={`${styles.card} ${styles.withMap} ${styles.reveal}`}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.addressLine)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapEmbed addressLine={store.addressLine} />
              <span className={styles.cardInner}>
                <span className={styles.icon} aria-hidden="true">
                  <StoreLinkIcon />
                </span>
                <span className={styles.body}>
                  <span className={styles.label}>Como chegar</span>
                  <span className={styles.meta}>{store.addressLine}</span>
                </span>
                <span className={styles.chev} aria-hidden="true">
                  <ChevronIcon />
                </span>
              </span>
            </a>
          ) : null}

          {store.instagramHandle ? (
            <a
              className={`${styles.card} ${styles.reveal}`}
              href={`https://instagram.com/${store.instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.icon} aria-hidden="true">
                <InstagramIcon />
              </span>
              <span className={styles.body}>
                <span className={styles.label}>Instagram</span>
                <span className={styles.meta}>@{store.instagramHandle}</span>
              </span>
              <span className={styles.chev} aria-hidden="true">
                <ChevronIcon />
              </span>
            </a>
          ) : null}

          {store.links.map((link) => (
            <a
              key={link.id}
              className={`${styles.card} ${styles.reveal}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.icon} aria-hidden="true">
                {extraLinkIcon(link.type)}
              </span>
              <span className={styles.body}>
                <span className={styles.label}>{link.label}</span>
              </span>
              <span className={styles.chev} aria-hidden="true">
                <ChevronIcon />
              </span>
            </a>
          ))}
        </nav>
      </div>

      <footer className={styles.footer}>{store.name}</footer>
    </div>
  );
}

function formatPhoneLabel(number: string): string {
  const digits = normalizeWhatsAppNumber(number).replace(/^55/, "");
  if (digits.length !== 10 && digits.length !== 11) return number;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  const splitAt = rest.length - 4;
  return `(${ddd}) ${rest.slice(0, splitAt)}-${rest.slice(splitAt)}`;
}
