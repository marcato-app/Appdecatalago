import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { BlockItemDto } from "@/lib/blocks";
import styles from "./Page.module.css";
import { ResultsCarousel } from "./ResultsCarousel";
import { DirectionsIcon, GlobeIcon, InstagramIcon, WhatsAppIcon } from "./icons";

// Faithful port of references/modelos/clinica-giullia-bandeira/index.html:
// same hero w/ animated ring photo frame, stats row, chips, results
// carousel, about card, reviews, link buttons, map + directions footer and
// floating WhatsApp button. WhatsApp/Instagram/address come from the
// store's own dedicated fields (same engine every template shares),
// stats/chips/results/about/reviews from the `blocks` the dashboard content
// manager (/dashboard/loja/conteudo) fills in.

export interface PageExtraLink {
  id: string;
  label: string;
  url: string;
  type: "website" | "app_store" | "play_store" | "custom";
}

export function Page({
  store,
  eyebrow,
  extraLinks,
  stats,
  chips,
  results,
  about,
  reviews,
}: {
  store: {
    name: string;
    tagline: string | null;
    bio: string | null;
    professionalCredential: string | null;
    logoUrl: string | null;
    whatsappNumber: string | null;
    instagramHandle: string | null;
    addressLine: string | null;
  };
  eyebrow: string | null;
  extraLinks: PageExtraLink[];
  stats: BlockItemDto[];
  chips: BlockItemDto[];
  results: BlockItemDto[];
  about: BlockItemDto | null;
  reviews: BlockItemDto[];
}) {
  const whatsappHref = store.whatsappNumber ? buildWhatsAppLink(store.whatsappNumber) : null;
  const mapsDirectionsHref = store.addressLine
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.addressLine)}`
    : null;

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.hero}>
          {eyebrow ? <div className={styles.eyebrow}>{eyebrow}</div> : null}

          <div className={styles.photoFrame}>
            <svg viewBox="0 0 196 196">
              <circle className={styles.ringPath} cx="98" cy="98" r="94" />
            </svg>
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- store-provided URL, no upload pipeline yet
              <img src={store.logoUrl} alt={store.name} />
            ) : null}
          </div>

          <h1>{store.name}</h1>
          {store.tagline ? <div className={styles.role}>{store.tagline}</div> : null}
          {store.professionalCredential ? <div className={styles.credential}>{store.professionalCredential}</div> : null}

          <svg className={styles.lipDivider} viewBox="0 0 120 14">
            <path d="M2 7 C 30 -3, 40 15, 60 7 C 80 -1, 90 15, 118 7" />
          </svg>

          {store.bio ? <p className={styles.tagline}>{store.bio}</p> : null}

          {whatsappHref ? (
            <a className={styles.heroCta} href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              Agendar consulta
            </a>
          ) : null}
        </div>

        {stats.length > 0 ? (
          <div className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.id} className={styles.stat}>
                <span className={styles.num}>{stat.title}</span>
                <span className={styles.lbl}>{stat.subtitle}</span>
              </div>
            ))}
          </div>
        ) : null}

        {chips.length > 0 ? (
          <>
            <div className={styles.sectionTitle}>Especialidades</div>
            <div className={styles.chips}>
              {chips.map((chip) => (
                <div key={chip.id} className={styles.chip}>
                  {chip.title}
                </div>
              ))}
            </div>
          </>
        ) : null}

        {results.length > 0 ? (
          <>
            <ResultsCarousel results={results} />
          </>
        ) : null}

        {about ? (
          <>
            <div className={styles.sectionTitle}>Sobre</div>
            <div className={styles.about}>
              {about.imageUrl ? (
                <div className={styles.aboutPhoto}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- store-provided URL, no upload pipeline yet */}
                  <img src={about.imageUrl} alt={store.name} />
                </div>
              ) : null}
              {about.body ? <p className={styles.aboutText}>{about.body}</p> : null}
            </div>
          </>
        ) : null}

        {reviews.length > 0 ? (
          <>
            <div className={styles.sectionTitle}>Avaliações</div>
            <div className={styles.reviews}>
              {reviews.map((review) => {
                const stars = typeof review.meta.stars === "number" ? review.meta.stars : 5;
                return (
                  <div key={review.id} className={styles.review}>
                    <div className={styles.stars}>{"★".repeat(stars)}</div>
                    <p>&ldquo;{review.body}&rdquo;</p>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        <div className={styles.links}>
          {whatsappHref ? (
            <a className={`${styles.linkBtn} ${styles.primary}`} href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <span className={styles.ic}>
                <WhatsAppIcon />
              </span>
              <span className={styles.txt}>
                WhatsApp
                <span className={styles.sub}>Agende sua avaliação</span>
              </span>
            </a>
          ) : null}

          {store.instagramHandle ? (
            <a
              className={styles.linkBtn}
              href={`https://instagram.com/${store.instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.ic}>
                <InstagramIcon />
              </span>
              <span className={styles.txt}>
                Instagram
                <span className={styles.sub}>@{store.instagramHandle}</span>
              </span>
            </a>
          ) : null}

          {extraLinks.map((link) => (
            <a key={link.id} className={styles.linkBtn} href={link.url} target="_blank" rel="noopener noreferrer">
              <span className={styles.ic}>
                <GlobeIcon />
              </span>
              <span className={styles.txt}>{link.label}</span>
            </a>
          ))}
        </div>

        <footer className={styles.footer}>
          <div className={styles.signature}>{store.name}</div>
          {eyebrow ? (
            <div className={styles.fine} style={{ marginTop: 2 }}>
              {eyebrow.toUpperCase()}
            </div>
          ) : null}

          <div className={styles.footLinks}>
            {whatsappHref ? (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            ) : null}
            {whatsappHref && store.instagramHandle ? <span>·</span> : null}
            {store.instagramHandle ? (
              <a href={`https://instagram.com/${store.instagramHandle}`} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            ) : null}
          </div>

          {store.addressLine ? (
            <>
              <div className={styles.addr}>{store.addressLine}</div>
              <div className={styles.mapFrame}>
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(store.addressLine)}&output=embed`}
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Mapa de ${store.name}`}
                />
              </div>
              {mapsDirectionsHref ? (
                <a className={styles.directionsBtn} href={mapsDirectionsHref} target="_blank" rel="noopener noreferrer">
                  <DirectionsIcon />
                  Como chegar
                </a>
              ) : null}
            </>
          ) : null}
        </footer>
      </div>

      {whatsappHref ? (
        <a className={styles.floatWhats} href={whatsappHref} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon />
        </a>
      ) : null}
    </div>
  );
}
