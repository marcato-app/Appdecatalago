import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { asc, eq, ne, and, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, products, productVariants, storeLinks } from "@/db/schema";
import { getStoreBySlugWithTemplate } from "@/lib/stores";
import { getCurrentUser } from "@/lib/auth/session";
import { resolveTheme } from "@/lib/theme";
import { findBusinessCategory } from "@/lib/business-categories";
import { resolveStorefrontSettings } from "@/lib/storefront-settings";
import { getTemplateManifest } from "@/templates/registry";
import type { TemplateTheme } from "@/templates/types";
import { ThemeStyle } from "@/components/store/ThemeStyle";
import { LinkHub as GenericLinkHub } from "@/components/store/LinkHub";
import { CardapioView } from "@/components/store/CardapioView";
import type { CardapioSection } from "@/components/store/types";
import { LinkHub as AdegaLinkHub, type LinkHubExtraLink } from "@/templates/adega-mm/LinkHub";
import { Cardapio as AdegaCardapio } from "@/templates/adega-mm/Cardapio";
import { Page as BarbeariaPage } from "@/templates/barbearia-tnt/Page";
import { Page as ClinicaPage } from "@/templates/clinica/Page";
import { Storefront as IphoneStorefront } from "@/templates/iphone-store/Storefront";
import { ProductDetail as IphoneProductDetail } from "@/templates/iphone-store/ProductDetail";
import type { IphoneProductDto } from "@/templates/iphone-store/types";
import { getStoreBlocks, findBlock } from "@/lib/blocks";

type Params = { slug: string; path?: string[] };

// Returns the store *and* its template slug together — both come from one
// cached query, shared between generateMetadata() and the page render.
//
// A store still in rascunho is invisible to the public (404), but its own
// lojista can open it to see how it looks before publishing — so the auth
// check only runs on that miss path, never on a normal customer visit.
async function getVisibleStore(slug: string) {
  const row = await getStoreBySlugWithTemplate(slug);
  if (!row) return null;
  if (row.store.status === "published") return { ...row, isPreview: false };

  const user = await getCurrentUser();
  if (user && user.id === row.store.ownerId) return { ...row, isPreview: true };

  return null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const visible = await getVisibleStore(slug);
  if (!visible) return { title: "Loja não encontrada" };

  return {
    title: visible.store.name,
    description: visible.store.tagline ?? visible.store.bio ?? undefined,
  };
}

async function buildCardapioSections(storeId: string): Promise<CardapioSection[]> {
  const [allCategories, allProducts] = await Promise.all([
    db.select().from(categories).where(eq(categories.storeId, storeId)).orderBy(asc(categories.sortOrder)),
    db
      .select()
      .from(products)
      .where(eq(products.storeId, storeId))
      .orderBy(asc(products.sortOrder)),
  ]);

  // categoryId is only nullable for the iphone-store template's products
  // (see db/schema.ts) — this function is only ever called for the
  // categories/products family, where every product has one.
  const activeProducts = allProducts.filter(
    (p): p is typeof p & { categoryId: string } => p.isActive && p.categoryId !== null,
  );
  const productsByCategory = new Map<string, typeof activeProducts>();
  for (const product of activeProducts) {
    const list = productsByCategory.get(product.categoryId) ?? [];
    list.push(product);
    productsByCategory.set(product.categoryId, list);
  }

  const groupsByParent = new Map<string, typeof allCategories>();
  for (const category of allCategories) {
    if (!category.parentId) continue;
    const list = groupsByParent.get(category.parentId) ?? [];
    list.push(category);
    groupsByParent.set(category.parentId, list);
  }

  const toProductDto = (p: (typeof activeProducts)[number]) => ({
    id: p.id,
    name: p.name,
    unitLabel: p.unitLabel,
    priceCents: p.priceCents,
    description: p.description,
    imageUrl: p.imageUrl,
  });

  return allCategories
    .filter((c) => !c.parentId)
    .map((section) => ({
      id: section.id,
      name: section.name,
      note: section.note,
      products: (productsByCategory.get(section.id) ?? []).map(toProductDto),
      groups: (groupsByParent.get(section.id) ?? []).map((group) => ({
        id: group.id,
        name: group.name,
        note: group.note,
        products: (productsByCategory.get(group.id) ?? []).map(toProductDto),
      })),
    }))
    .filter((section) => section.products.length > 0 || section.groups.some((g) => g.products.length > 0));
}

function toIphoneProductDtos(
  productRows: (typeof products.$inferSelect)[],
  variantRows: (typeof productVariants.$inferSelect)[],
): IphoneProductDto[] {
  const variantsByProduct = new Map<string, typeof variantRows>();
  for (const variant of variantRows) {
    const list = variantsByProduct.get(variant.productId) ?? [];
    list.push(variant);
    variantsByProduct.set(variant.productId, list);
  }

  return productRows
    .map((product) => ({
      id: product.id,
      name: product.name,
      condition: product.condition,
      grade: product.grade,
      batteryHealthPct: product.batteryHealthPct,
      description: product.description,
      includedItems: (product.includedItems as string[] | null) ?? [],
      variants: (variantsByProduct.get(product.id) ?? [])
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((v) => ({
          id: v.id,
          color: v.color,
          storageLabel: v.storageLabel,
          priceCents: v.priceCents,
          imageUrls: (v.imageUrls as string[] | null) ?? [],
        })),
    }))
    .filter((product) => product.variants.length > 0);
}

async function getIphoneStoreProducts(storeId: string): Promise<IphoneProductDto[]> {
  const productRows = await db
    .select()
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.isActive, true)))
    .orderBy(asc(products.sortOrder));

  if (productRows.length === 0) return [];

  const variantRows = await db
    .select()
    .from(productVariants)
    .where(
      inArray(
        productVariants.productId,
        productRows.map((p) => p.id),
      ),
    );

  return toIphoneProductDtos(productRows, variantRows);
}

async function getIphoneStoreProduct(storeId: string, productId: string): Promise<IphoneProductDto | null> {
  const product = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.storeId, storeId), eq(products.isActive, true)),
  });
  if (!product) return null;

  const variantRows = await db.select().from(productVariants).where(eq(productVariants.productId, product.id));
  const [dto] = toIphoneProductDtos([product], variantRows);
  return dto ?? null;
}

const RENDERABLE_LINK_TYPES = ["website", "app_store", "play_store", "custom"] as const;

async function getExtraLinks(storeId: string): Promise<LinkHubExtraLink[]> {
  const rows = await db
    .select()
    .from(storeLinks)
    .where(and(eq(storeLinks.storeId, storeId), ne(storeLinks.type, "instagram"), ne(storeLinks.type, "whatsapp")))
    .orderBy(asc(storeLinks.sortOrder));

  return rows
    .filter((row): row is typeof row & { type: (typeof RENDERABLE_LINK_TYPES)[number] } =>
      (RENDERABLE_LINK_TYPES as readonly string[]).includes(row.type),
    )
    .map((row) => ({ id: row.id, label: row.label, url: row.url, type: row.type }));
}

function catalogMeta(sections: CardapioSection[]): string {
  if (sections.length === 0) return "Veja todos os produtos e faça seu pedido";
  const names = sections.map((s) => s.name).slice(0, 4);
  return names.join(", ");
}

// Thin wrapper so the "rascunho" bar renders once for the owner's preview,
// instead of being repeated in every one of the template branches below.
export default async function StorePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const visible = await getVisibleStore(slug);

  return (
    <>
      {visible?.isPreview ? <DraftPreviewBar /> : null}
      <StoreContent params={params} />
    </>
  );
}

function DraftPreviewBar() {
  return (
    <div className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 bg-amber-400 px-4 py-2 text-center text-sm font-medium text-amber-950">
      <span>Prévia — sua loja está em rascunho e ninguém além de você consegue ver.</span>
      <Link href="/dashboard/loja" className="underline underline-offset-2">
        Publicar agora
      </Link>
    </div>
  );
}

async function StoreContent({ params }: { params: Promise<Params> }) {
  const { slug, path } = await params;

  const visible = await getVisibleStore(slug);
  if (!visible) notFound();

  const { store, templateSlug } = visible;
  const manifest = templateSlug ? getTemplateManifest(templateSlug) : undefined;
  if (!manifest) notFound();

  const theme = resolveTheme(manifest.defaultTheme, store.theme) as TemplateTheme;
  const segment = path?.[0];
  const isAdegaMm = manifest.slug === "adega-mm";

  if (store.businessType === "portfolio") {
    if (segment) notFound(); // single-page templates — no sub-routes like /cardapio

    const [extraLinks, storeBlocks] = await Promise.all([getExtraLinks(store.id), getStoreBlocks(store.id)]);

    if (manifest.slug === "barbearia-tnt") {
      return (
        <>
          <ThemeStyle theme={theme} />
          <BarbeariaPage
            store={{
              name: store.name,
              tagline: store.tagline,
              logoUrl: store.logoUrl,
              coverImageUrl: store.coverImageUrl,
              whatsappNumber: store.whatsappNumber,
              instagramHandle: store.instagramHandle,
              addressLine: store.addressLine,
            }}
            extraLinks={extraLinks}
            team={findBlock(storeBlocks, "team")?.items ?? []}
            gallery={findBlock(storeBlocks, "gallery")?.items ?? []}
          />
        </>
      );
    }

    if (manifest.slug === "clinica") {
      const businessCategory = findBusinessCategory(store.businessCategory);
      const about = findBlock(storeBlocks, "about")?.items ?? [];
      return (
        <>
          <ThemeStyle theme={theme} />
          <ClinicaPage
            store={{
              name: store.name,
              tagline: store.tagline,
              bio: store.bio,
              professionalCredential: store.professionalCredential,
              logoUrl: store.logoUrl,
              whatsappNumber: store.whatsappNumber,
              instagramHandle: store.instagramHandle,
              addressLine: store.addressLine,
            }}
            eyebrow={businessCategory?.subMark ?? null}
            extraLinks={extraLinks}
            stats={findBlock(storeBlocks, "stats")?.items ?? []}
            chips={findBlock(storeBlocks, "chips")?.items ?? []}
            results={findBlock(storeBlocks, "results_carousel")?.items ?? []}
            about={about[0] ?? null}
            reviews={findBlock(storeBlocks, "reviews")?.items ?? []}
          />
        </>
      );
    }

    notFound();
  }

  if (manifest.slug === "iphone-store") {
    const storeInfo = {
      slug: store.slug,
      name: store.name,
      tagline: store.tagline,
      logoUrl: store.logoUrl,
      instagramHandle: store.instagramHandle,
      whatsappNumber: store.whatsappNumber,
    };
    const settings = resolveStorefrontSettings(store.storefrontSettings);

    if (!segment) {
      const iphoneProducts = await getIphoneStoreProducts(store.id);
      return (
        <>
          <ThemeStyle theme={theme} />
          <IphoneStorefront store={storeInfo} products={iphoneProducts} settings={settings} />
        </>
      );
    }

    if (segment === "produto" && path?.length === 2) {
      const product = await getIphoneStoreProduct(store.id, path[1]);
      if (!product) notFound();
      return (
        <>
          <ThemeStyle theme={theme} />
          <IphoneProductDetail store={storeInfo} product={product} settings={settings} />
        </>
      );
    }

    notFound();
  }

  if (!segment) {
    if (isAdegaMm) {
      const [sections, extraLinks] = await Promise.all([buildCardapioSections(store.id), getExtraLinks(store.id)]);
      const businessCategory = findBusinessCategory(store.businessCategory);
      return (
        <>
          <ThemeStyle theme={theme} />
          <AdegaLinkHub
            store={{
              name: store.name,
              subMark: businessCategory?.subMark ?? null,
              tagline: store.tagline,
              logoUrl: store.logoUrl,
              whatsappNumber: store.whatsappNumber,
              instagramHandle: store.instagramHandle,
              addressLine: store.addressLine,
              links: extraLinks,
            }}
            catalogHref={`/${store.slug}/cardapio`}
            catalogLabel="Cardápio"
            catalogMeta={catalogMeta(sections)}
          />
        </>
      );
    }

    return (
      <>
        <ThemeStyle theme={theme} />
        <GenericLinkHub
          store={{
            name: store.name,
            tagline: store.tagline,
            bio: store.bio,
            logoUrl: store.logoUrl,
            whatsappNumber: store.whatsappNumber,
            instagramHandle: store.instagramHandle,
            addressLine: store.addressLine,
          }}
          catalogHref={`/${store.slug}/cardapio`}
        />
      </>
    );
  }

  if (segment === "cardapio" && (path?.length ?? 0) === 1) {
    const sections = await buildCardapioSections(store.id);

    if (isAdegaMm) {
      return (
        <>
          <ThemeStyle theme={theme} />
          <AdegaCardapio
            storeId={store.id}
            storeName={store.name}
            homeHref={`/${store.slug}`}
            logoUrl={store.logoUrl}
            instagramHandle={store.instagramHandle}
            whatsappNumber={store.whatsappNumber}
            sections={sections}
          />
        </>
      );
    }

    return (
      <>
        <ThemeStyle theme={theme} />
        <CardapioView storeId={store.id} storeName={store.name} whatsappNumber={store.whatsappNumber} sections={sections} />
      </>
    );
  }

  notFound();
}
