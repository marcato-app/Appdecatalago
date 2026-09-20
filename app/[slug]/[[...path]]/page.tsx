import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { asc, eq, ne, and } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, products, storeLinks, templates } from "@/db/schema";
import { getStoreBySlug } from "@/lib/stores";
import { resolveTheme } from "@/lib/theme";
import { findBusinessCategory } from "@/lib/business-categories";
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
import { getStoreBlocks, findBlock } from "@/lib/blocks";

type Params = { slug: string; path?: string[] };

async function getPublishedStore(slug: string) {
  const store = await getStoreBySlug(slug);
  if (!store || store.status !== "published") return null;
  return store;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const store = await getPublishedStore(slug);
  if (!store) return { title: "Loja não encontrada" };

  return {
    title: store.name,
    description: store.tagline ?? store.bio ?? undefined,
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

  const activeProducts = allProducts.filter((p) => p.isActive);
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

export default async function StorePage({ params }: { params: Promise<Params> }) {
  const { slug, path } = await params;

  const store = await getPublishedStore(slug);
  if (!store) notFound();

  const templateRow = await db.query.templates.findFirst({ where: eq(templates.id, store.templateId) });
  const manifest = templateRow ? getTemplateManifest(templateRow.slug) : undefined;
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
