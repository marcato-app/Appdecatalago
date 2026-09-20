import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { BlockItemDto } from "@/lib/blocks";
import styles from "./Page.module.css";
import { DragScroll } from "./DragScroll";
import { AppIcon, ExternalArrowIcon, GlobeIcon, InstagramIcon, PinIcon } from "./icons";

// Faithful port of references/modelos/barbearia-tnt/index.html: same hero
// photo w/ floating logo, link cards, horizontal-drag team/gallery strips
// and map card. App Store/Play Store/site links come from store_links,
// Instagram/WhatsApp/address from the store's own dedicated fields (same
// engine every template shares), team/gallery from the `blocks` the
// dashboard content manager (/dashboard/loja/conteudo) fills in.

export interface PageExtraLink {
  id: string;
  label: string;
  url: string;
  type: "website" | "app_store" | "play_store" | "custom";
}

const LINK_SUBTITLES: Record<PageExtraLink["type"], string> = {
  app_store: "iOS · App Store",
  play_store: "Android · Google Play",
  website: "Site",
  custom: "",
};

export function Page({
  store,
  extraLinks,
  team,
  gallery,
}: {
  store: {
    name: string;
    tagline: string | null;
    logoUrl: string | null;
    coverImageUrl: string | null;
    whatsappNumber: string | null;
    instagramHandle: string | null;
    addressLine: string | null;
  };
  extraLinks: PageExtraLink[];
  team: BlockItemDto[];
  gallery: BlockItemDto[];
}) {
  const mapUrl = store.addressLine
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.addressLine)}`
    : null;

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.heroPhoto}>
          {store.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- store-provided URL, no upload pipeline yet
            <img className={styles.heroPhotoBg} src={store.coverImageUrl} alt={`Interior de ${store.name}`} />
          ) : null}
          {store.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- store-provided URL, no upload pipeline yet
            <img className={styles.heroPhotoLogo} src={store.logoUrl} alt={store.name} />
          ) : null}
        </div>

        <div className={styles.profile}>
          <h1>{store.name}</h1>
          {store.tagline ? <p className={styles.tag}>{store.tagline}</p> : null}
        </div>

        <div className={styles.links}>
          {extraLinks
            .filter((link) => link.type === "app_store" || link.type === "play_store")
            .map((link) => (
              <a key={link.id} className={`${styles.linkCard} ${styles.primary}`} href={link.url} target="_blank" rel="noopener noreferrer">
                <span className={styles.linkIcon}>
                  <AppIcon />
                </span>
                <span className={styles.linkBody}>
                  <span className={styles.title}>{link.label}</span>
                  <span className={styles.sub}>{LINK_SUBTITLES[link.type]}</span>
                </span>
                <span className={styles.linkChevron}>›</span>
              </a>
            ))}

          {store.whatsappNumber ? (
            <a className={styles.linkCard} href={buildWhatsAppLink(store.whatsappNumber)} target="_blank" rel="noopener noreferrer">
              <span className={styles.linkIcon}>
                <AppIcon />
              </span>
              <span className={styles.linkBody}>
                <span className={styles.title}>Agendar horário</span>
                <span className={styles.sub}>Chame no WhatsApp</span>
              </span>
              <span className={styles.linkChevron}>›</span>
            </a>
          ) : null}

          {store.instagramHandle ? (
            <a
              className={styles.linkCard}
              href={`https://instagram.com/${store.instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.linkIcon}>
                <InstagramIcon />
              </span>
              <span className={styles.linkBody}>
                <span className={styles.title}>Instagram</span>
                <span className={styles.sub}>@{store.instagramHandle}</span>
              </span>
              <span className={styles.linkChevron}>›</span>
            </a>
          ) : null}

          {extraLinks
            .filter((link) => link.type === "website" || link.type === "custom")
            .map((link) => (
              <a key={link.id} className={styles.linkCard} href={link.url} target="_blank" rel="noopener noreferrer">
                <span className={styles.linkIcon}>
                  <GlobeIcon />
                </span>
                <span className={styles.linkBody}>
                  <span className={styles.title}>{link.label}</span>
                </span>
                <span className={styles.linkChevron}>›</span>
              </a>
            ))}
        </div>

        {team.length > 0 ? (
          <>
            <div className={styles.sectionHead}>
              <div className={styles.eyebrow}>A equipe</div>
              <h2>Nossos profissionais</h2>
            </div>
            <DragScroll>
              {team.map((member) => (
                <div key={member.id} className={styles.member}>
                  <div className={styles.photoWrap}>
                    {member.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- store-provided URL, no upload pipeline yet
                      <img src={member.imageUrl} alt={member.title ?? ""} loading="lazy" />
                    ) : null}
                  </div>
                  <div className={styles.memberInfo}>
                    <h3>{member.title}</h3>
                    {member.subtitle ? <p>{member.subtitle}</p> : null}
                  </div>
                </div>
              ))}
            </DragScroll>
            <p className={`${styles.dragHint} ${styles.teamHint}`}>arraste para o lado →</p>
          </>
        ) : null}

        {gallery.length > 0 ? (
          <>
            <div className={styles.sectionHead}>
              <div className={styles.eyebrow}>Nosso trabalho</div>
              <h2>Mural de trabalhos</h2>
            </div>
            <DragScroll className={styles.galleryScroll}>
              {gallery.map((photo) => (
                <div key={photo.id} className={styles.galleryItem}>
                  {photo.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- store-provided URL, no upload pipeline yet
                    <img src={photo.imageUrl} alt={photo.title ?? `Trabalho de ${store.name}`} loading="lazy" />
                  ) : null}
                </div>
              ))}
            </DragScroll>
            <p className={`${styles.dragHint} ${styles.galleryHint}`}>arraste para o lado →</p>
          </>
        ) : null}

        {store.addressLine && mapUrl ? (
          <div className={styles.mapCard}>
            <div className={styles.mapPreview}>
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(store.addressLine)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Mapa de ${store.name}`}
              />
              <a className={styles.mapsBadge} href={mapUrl} target="_blank" rel="noopener noreferrer">
                <ExternalArrowIcon />
                Maps
              </a>
            </div>
            <a className={styles.linkCard} href={mapUrl} target="_blank" rel="noopener noreferrer">
              <span className={styles.linkIcon}>
                <PinIcon />
              </span>
              <span className={styles.linkBody}>
                <span className={styles.title}>Como chegar</span>
                <span className={styles.sub}>{store.addressLine}</span>
              </span>
              <span className={styles.linkChevron}>›</span>
            </a>
          </div>
        ) : null}

        <footer className={styles.footer}>
          <div className={styles.fh}>{store.name.toUpperCase()}</div>
        </footer>
      </div>
    </div>
  );
}
