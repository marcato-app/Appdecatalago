"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import { useSmoothScroll } from "@/lib/useSmoothScroll";
import { buildOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import { formatCentsToBRL } from "@/lib/money";
import type { CardapioProduct, CardapioSection } from "@/components/store/types";
import styles from "./Cardapio.module.css";
import { WelcomeSplash } from "./WelcomeSplash";

// Faithful port of references/modelos/adega-mm/cardapio.html + script.js:
// same welcome splash, sticky header with scroll-spy nav pills, hero,
// search, section/group/item layout with the "+" → stepper qty control,
// footer, back-to-top, and cart bar/drawer that builds the WhatsApp order
// message. Cart state and WhatsApp link building reuse lib/cart.ts and
// lib/whatsapp.ts (same engine every template shares) — only the
// markup/CSS is template-specific here.

function matches(query: string, ...values: (string | null)[]): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return values.some((value) => value?.toLowerCase().includes(needle));
}

function filterSections(sections: CardapioSection[], query: string): CardapioSection[] {
  if (!query.trim()) return sections;
  return sections
    .map((section) => ({
      ...section,
      products: section.products.filter((p) => matches(query, p.name, p.description, p.unitLabel)),
      groups: section.groups
        .map((group) => ({
          ...group,
          products: group.products.filter((p) => matches(query, p.name, p.description, p.unitLabel)),
        }))
        .filter((group) => group.products.length > 0),
    }))
    .filter((section) => section.products.length > 0 || section.groups.length > 0);
}

export function Cardapio({
  storeId,
  storeName,
  homeHref,
  logoUrl,
  instagramHandle,
  whatsappNumber,
  sections,
}: {
  storeId: string;
  storeName: string;
  homeHref: string;
  logoUrl: string | null;
  instagramHandle: string | null;
  whatsappNumber: string | null;
  sections: CardapioSection[];
}) {
  const [query, setQuery] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cart = useCart(storeId);
  useSmoothScroll();

  const filteredSections = useMemo(() => filterSections(sections, query), [sections, query]);
  const cartMap = useMemo(() => new Map(cart.entries.map((entry) => [entry.productId, entry])), [cart.entries]);

  useEffect(() => {
    function onScroll() {
      const scrollPos = window.scrollY + 110;
      let current: string | null = null;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.offsetTop <= scrollPos) current = section.id;
      }
      setActiveSectionId(current);
      setShowBackToTop(window.scrollY > 500);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  const whatsappHref = useMemo(() => {
    if (!whatsappNumber || cart.entries.length === 0) return null;
    const message = buildOrderMessage(
      storeName,
      cart.entries.map((entry) => ({
        name: entry.name,
        unitLabel: entry.unitLabel,
        priceCents: entry.priceCents,
        quantity: entry.qty,
      })),
    );
    return buildWhatsAppLink(whatsappNumber, message);
  }, [whatsappNumber, cart.entries, storeName]);

  function handleQtyChange(product: CardapioProduct, qty: number) {
    cart.setQty(product.id, qty, { name: product.name, unitLabel: product.unitLabel, priceCents: product.priceCents });
  }

  return (
    <div className={styles.page}>
      <WelcomeSplash storeId={storeId} storeName={storeName} logoUrl={logoUrl} />

      <header className={styles.siteHeader}>
        <div className={styles.headerInner}>
          <a href={homeHref} className={styles.brand} aria-label={storeName}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- store-provided URL, no upload pipeline yet
              <img src={logoUrl} alt={storeName} className={styles.brandLogo} />
            ) : null}
            <span className={styles.brandText}>{storeName}</span>
          </a>
        </div>
        {sections.length > 0 ? (
          <nav className={styles.siteNav}>
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className={activeSectionId === section.id ? styles.active : undefined}>
                {section.name}
              </a>
            ))}
          </nav>
        ) : null}
      </header>

      <div id="topo" className={styles.hero}>
        <div className={styles.heroOverlay}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- store-provided URL, no upload pipeline yet
            <img src={logoUrl} alt="" className={styles.heroLogo} />
          ) : null}
          <h1>Cardápio</h1>
          <p>{storeName}</p>
        </div>
      </div>

      <div className={styles.searchBar}>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar produtos…"
          className={styles.searchInput}
        />
      </div>

      <main className={styles.main}>
        {filteredSections.length === 0 ? (
          <p className={styles.noResults}>Nenhum item encontrado.</p>
        ) : (
          filteredSections.map((section) => (
            <section key={section.id} id={section.id} className={styles.menuSection}>
              <h2 className={styles.sectionTitle}>{section.name}</h2>
              {section.note ? <p className={styles.groupNote}>{section.note}</p> : null}

              {section.products.length > 0 ? (
                <ul className={styles.menuList}>
                  {section.products.map((product) => (
                    <ItemRow
                      key={product.id}
                      product={product}
                      qty={cartMap.get(product.id)?.qty ?? 0}
                      onQtyChange={(qty) => handleQtyChange(product, qty)}
                    />
                  ))}
                </ul>
              ) : null}

              {section.groups.map((group) => (
                <div key={group.id}>
                  <h3 className={styles.groupTitle} id={group.id}>
                    {group.name}
                  </h3>
                  {group.note ? <p className={styles.groupNote}>{group.note}</p> : null}
                  <ul className={styles.menuList}>
                    {group.products.map((product) => (
                      <ItemRow
                        key={product.id}
                        product={product}
                        qty={cartMap.get(product.id)?.qty ?? 0}
                        onQtyChange={(qty) => handleQtyChange(product, qty)}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))
        )}
      </main>

      <footer className={styles.siteFooter}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- store-provided URL, no upload pipeline yet
          <img src={logoUrl} alt={storeName} className={styles.footerLogo} />
        ) : null}
        <p className={styles.footerName}>{storeName}</p>
        {instagramHandle ? (
          <a href={`https://instagram.com/${instagramHandle}`} target="_blank" rel="noopener noreferrer">
            @{instagramHandle}
          </a>
        ) : null}
        <p className={styles.footerNote}>Cardápio sujeito a alterações sem aviso prévio.</p>
      </footer>

      <a href="#topo" className={`${styles.backToTop} ${showBackToTop ? styles.visible : ""}`} aria-label="Voltar ao topo">
        ↑
      </a>

      <div className={`${styles.cartBar} ${cart.totalCount === 0 ? styles.hidden : ""}`}>
        <button type="button" className={styles.cartBarBtn} onClick={() => setIsCartOpen(true)}>
          <span className={styles.cartBarIcon} aria-hidden="true">
            🛒
          </span>
          <span className={styles.cartBarCount}>{cart.totalCount}</span>
          <span className={styles.cartBarLabel}>Ver pedido</span>
          <span className={styles.cartBarTotal}>{formatCentsToBRL(cart.totalCents)}</span>
        </button>
      </div>

      <div className={`${styles.cartOverlay} ${isCartOpen ? "" : styles.hidden}`} onClick={() => setIsCartOpen(false)} />
      <aside className={`${styles.cartDrawer} ${isCartOpen ? "" : styles.hidden}`} aria-label="Seu pedido">
        <div className={styles.cartDrawerHead}>
          <h2>Seu pedido</h2>
          <button type="button" className={styles.cartClose} onClick={() => setIsCartOpen(false)} aria-label="Fechar">
            &times;
          </button>
        </div>

        {cart.entries.length === 0 ? (
          <p className={styles.cartEmpty}>Seu carrinho está vazio.</p>
        ) : (
          <ul className={styles.cartList}>
            {cart.entries.map((entry) => (
              <li key={entry.productId} className={styles.cartItem}>
                <div className={styles.cartItemInfo}>
                  <span className={styles.cartItemName}>
                    {entry.name} {entry.unitLabel ? <span className={styles.unit}>{entry.unitLabel}</span> : null}
                  </span>
                  <span className={styles.cartItemPrice}>{formatCentsToBRL(entry.qty * entry.priceCents)}</span>
                </div>
                <span className={styles.qtyStepper}>
                  <button type="button" aria-label="Diminuir quantidade" onClick={() => cart.setQty(entry.productId, entry.qty - 1, entry)}>
                    −
                  </button>
                  <span className={styles.qtyValue}>{entry.qty}</span>
                  <button type="button" aria-label="Aumentar quantidade" onClick={() => cart.setQty(entry.productId, entry.qty + 1, entry)}>
                    +
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.cartDrawerFoot}>
          <div className={styles.cartDrawerTotal}>
            <span>Total</span>
            <span>{formatCentsToBRL(cart.totalCents)}</span>
          </div>
          {cart.entries.length > 0 ? (
            <button type="button" className={styles.cartClear} onClick={cart.clear}>
              Limpar pedido
            </button>
          ) : null}
          <a
            href={whatsappHref ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!whatsappHref}
            className={`${styles.cartSend} ${whatsappHref ? "" : styles.isDisabled}`}
          >
            Enviar pedido no WhatsApp
          </a>
        </div>
      </aside>
    </div>
  );
}

function ItemRow({
  product,
  qty,
  onQtyChange,
}: {
  product: CardapioProduct;
  qty: number;
  onQtyChange: (qty: number) => void;
}) {
  return (
    <li className={styles.item}>
      <div className={styles.itemRow}>
        <span className={styles.itemName}>
          {product.name} {product.unitLabel ? <span className={styles.unit}>{product.unitLabel}</span> : null}
        </span>
        <span className={styles.itemRight}>
          <span className={styles.itemPrice}>{formatCentsToBRL(product.priceCents)}</span>
          <span className={styles.qtyControl}>
            {qty === 0 ? (
              <button type="button" className={styles.qtyAdd} aria-label={`Adicionar ${product.name}`} onClick={() => onQtyChange(1)}>
                +
              </button>
            ) : (
              <span className={styles.qtyStepper}>
                <button type="button" aria-label="Diminuir quantidade" onClick={() => onQtyChange(qty - 1)}>
                  −
                </button>
                <span className={styles.qtyValue}>{qty}</span>
                <button type="button" aria-label="Aumentar quantidade" onClick={() => onQtyChange(qty + 1)}>
                  +
                </button>
              </span>
            )}
          </span>
        </span>
      </div>
      {product.description ? <p className={styles.itemNote}>{product.description}</p> : null}
    </li>
  );
}
