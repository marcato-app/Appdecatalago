import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { StorefrontSettings } from "@/lib/storefront-settings";
import { BoltIcon, ShareIcon, ShieldCheckIcon, TruckIcon, WhatsAppIcon } from "./icons";
import { StorefrontGrid } from "./StorefrontGrid";
import styles from "./Storefront.module.css";
import type { IphoneProductDto, IphoneStoreInfo } from "./types";

export function Storefront({
  store,
  products,
  settings,
}: {
  store: IphoneStoreInfo;
  products: IphoneProductDto[];
  settings: StorefrontSettings;
}) {
  const whatsappHref = store.whatsappNumber
    ? buildWhatsAppLink(store.whatsappNumber, `Olá! Vi a vitrine da ${store.name} e queria saber mais.`)
    : null;

  const hasBadges = settings.badges.verified || settings.badges.respondsFast || settings.badges.readyDelivery;

  const headerTop = (
    <>
      <div className={styles.headerTop}>
        <div className={styles.avatar}>
          {store.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- store-provided logo
            <img src={store.logoUrl} alt={store.name} />
          ) : (
            store.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className={styles.storeInfo}>
          <h1 className={styles.storeName}>{store.name}</h1>
          {store.tagline ? <p className={styles.tagline}>{store.tagline}</p> : null}
        </div>
        <button type="button" className={styles.shareButton} aria-label="Compartilhar">
          <ShareIcon size={16} />
        </button>
      </div>

      {hasBadges ? (
        <div className={styles.badges}>
          {settings.badges.verified ? (
            <span className={styles.badge}>
              <ShieldCheckIcon /> Loja Verificada
            </span>
          ) : null}
          {settings.badges.respondsFast ? (
            <span className={styles.badge}>
              <BoltIcon /> Responde Rápido
            </span>
          ) : null}
          {settings.badges.readyDelivery ? (
            <span className={styles.badge}>
              <TruckIcon /> Pronta Entrega
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <StorefrontGrid header={headerTop} products={products} storeSlug={store.slug} settings={settings} />
      </div>

      {whatsappHref ? (
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={styles.whatsappFab} aria-label="Falar no WhatsApp">
          <WhatsAppIcon size={26} />
        </a>
      ) : null}
    </div>
  );
}
