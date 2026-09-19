import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, products, templates } from "@/db/schema";
import { getStoreBySlug } from "@/lib/stores";
import { resolveTheme } from "@/lib/theme";
import { getTemplateManifest } from "@/templates/registry";
import type { TemplateTheme } from "@/templates/types";
import { ThemeStyle } from "@/components/store/ThemeStyle";
import { LinkHub } from "@/components/store/LinkHub";
import { CardapioView } from "@/components/store/CardapioView";
import type { CardapioSection } from "@/components/store/types";

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

export default async function StorePage({ params }: { params: Promise<Params> }) {
  const { slug, path } = await params;

  const store = await getPublishedStore(slug);
  if (!store) notFound();

  const templateRow = await db.query.templates.findFirst({ where: eq(templates.id, store.templateId) });
  const manifest = templateRow ? getTemplateManifest(templateRow.slug) : undefined;
  if (!manifest) notFound();

  const theme = resolveTheme(manifest.defaultTheme, store.theme) as TemplateTheme;
  const segment = path?.[0];

  if (!segment) {
    return (
      <>
        <ThemeStyle theme={theme} />
        <LinkHub
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
    return (
      <>
        <ThemeStyle theme={theme} />
        <CardapioView storeId={store.id} storeName={store.name} whatsappNumber={store.whatsappNumber} sections={sections} />
      </>
    );
  }

  notFound();
}
