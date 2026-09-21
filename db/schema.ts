import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  jsonb,
  numeric,
  timestamp,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const businessTypeEnum = pgEnum("business_type", [
  "catalog", // sells priced products (Adega MM shape)
  "portfolio", // showcases services/work (Barbearia TNT / clinic shape)
]);

export const storeStatusEnum = pgEnum("store_status", ["draft", "published"]);

export const storeLinkTypeEnum = pgEnum("store_link_type", [
  "instagram",
  "whatsapp",
  "app_store",
  "play_store",
  "website",
  "custom",
]);

export const blockTypeEnum = pgEnum("block_type", [
  "stats",
  "chips",
  "team",
  "gallery",
  "reviews",
  "results_carousel",
  "about",
  "map",
  "links",
]);

// Only used by the iphone-store template's products (condição do aparelho).
// Nullable/unused on every other catalog template.
export const productConditionEnum = pgEnum("product_condition", ["lacrado", "seminovo", "cpo"]);

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  authProviderId: text("auth_provider_id").unique(),
  // Placeholder for the local auth used before a real Supabase project is
  // connected (see lib/auth/). Nullable because it becomes unused once
  // Supabase Auth (authProviderId) takes over.
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Templates (the "modelo" registry — one row per template package under
// templates/<slug> in the app code, see templates/registry.ts)
// ---------------------------------------------------------------------------

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(), // 'adega-mm' | 'barbearia-tnt' | 'clinica'
  name: text("name").notNull(),
  businessType: businessTypeEnum("business_type").notNull(),
  previewImageUrl: text("preview_image_url"),
  defaultTheme: jsonb("default_theme").notNull().default({}),
  blockManifest: jsonb("block_manifest").notNull().default({}),
  isActive: boolean("is_active").notNull().default(true),
});

// ---------------------------------------------------------------------------
// Stores
// ---------------------------------------------------------------------------

export const stores = pgTable(
  "stores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    businessType: businessTypeEnum("business_type").notNull(),
    // "Ramo de atividade" — id into lib/business-categories.ts, not its own
    // enum: the list is app-level (recommends templates in the UI) rather
    // than a hard data-integrity constraint the DB needs to enforce.
    businessCategory: text("business_category"),
    // CNPJ, quando houver (opcional — pessoa física / MEI informal pode não
    // ter). Guardado só com dígitos (14), formatação é responsabilidade da UI.
    cnpj: text("cnpj"),
    // Registro de conselho profissional (CRM, CRBM, CRO, OAB...), quando
    // houver — usado pelo template `clinica` como a linha pequena abaixo do
    // cargo, mas é um campo genérico o bastante pra qualquer profissional
    // regulamentado, não travado a um template.
    professionalCredential: text("professional_credential"),
    templateId: uuid("template_id")
      .notNull()
      .references(() => templates.id),
    theme: jsonb("theme").notNull().default({}),
    tagline: text("tagline"),
    bio: text("bio"),
    logoUrl: text("logo_url"),
    coverImageUrl: text("cover_image_url"),
    whatsappNumber: text("whatsapp_number"),
    whatsappMessageTemplate: text("whatsapp_message_template"),
    instagramHandle: text("instagram_handle"),
    addressLine: text("address_line"),
    addressLat: numeric("address_lat"),
    addressLng: numeric("address_lng"),
    businessHours: jsonb("business_hours").notNull().default([]),
    // Vitrine display settings specific to templates that need them (e.g.
    // iphone-store's trust badges/installments/grid density) — kept generic
    // (not iphone-only columns) so another template can reuse the same slot
    // later. Shape lives in lib/storefront-settings.ts, not enforced by the DB.
    storefrontSettings: jsonb("storefront_settings").notNull().default({}),
    status: storeStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("stores_slug_idx").on(table.slug)],
);

// ---------------------------------------------------------------------------
// Catalog family (Adega MM shape): categories are self-referencing so the
// same table covers both "sections" (parentId null) and "groups" (parentId
// set) without hardcoding a fixed nesting depth.
// ---------------------------------------------------------------------------

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  parentId: uuid("parent_id").references((): AnyPgColumn => categories.id),
  name: text("name").notNull(),
  note: text("note"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  // Nullable because the iphone-store template doesn't use sections/groups —
  // its products (aparelhos) are grouped by `condition` instead.
  categoryId: uuid("category_id").references(() => categories.id),
  name: text("name").notNull(),
  unitLabel: text("unit_label"),
  // For iphone-store products this is denormalized as the lowest variant
  // price (see productVariants below) — kept in sync on save so every other
  // part of the app that already reads priceCents/imageUrl (sorting,
  // listings) keeps working without knowing about variants.
  priceCents: integer("price_cents").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  // --- iphone-store-only fields (null on every other template's products) ---
  condition: productConditionEnum("condition"),
  grade: text("grade"), // A / AB / B — only meaningful when condition = 'seminovo'
  batteryHealthPct: integer("battery_health_pct"),
  includedItems: jsonb("included_items").notNull().default([]), // string[] — "Caixa", "Cabo"...
});

// Color/storage variants of a single iphone-store product ("iPhone 14"):
// each combination has its own price and up to 4 photos. Only used by the
// iphone-store template — every other catalog template's products have zero
// variant rows and priceCents/imageUrl on the product itself are authoritative.
export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  color: text("color").notNull(),
  storageLabel: text("storage_label"), // "128GB", "1TB"...
  priceCents: integer("price_cents").notNull(),
  imageUrls: jsonb("image_urls").notNull().default([]), // string[], up to 4
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---------------------------------------------------------------------------
// iPhone reference catalog — global, app-level data (NOT store-scoped, no
// storeId/ownerId). Lets any lojista using the iphone-store template pick a
// real model from a pre-filled list (name, marketing description, technical
// specs, real color/storage combinations) instead of typing every field by
// hand — they still set their own price and upload their own photos per
// variant. Seeded via db/seed-iphone-catalog.ts, same pattern as `templates`.
// ---------------------------------------------------------------------------

export const iphoneCatalogModels = pgTable("iphone_catalog_models", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  specsText: text("specs_text").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const iphoneCatalogVariants = pgTable("iphone_catalog_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  modelId: uuid("model_id")
    .notNull()
    .references(() => iphoneCatalogModels.id),
  color: text("color").notNull(),
  storageLabel: text("storage_label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---------------------------------------------------------------------------
// Shared across both template families
// ---------------------------------------------------------------------------

export const storeLinks = pgTable("store_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  type: storeLinkTypeEnum("type").notNull(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---------------------------------------------------------------------------
// Portfolio family (Barbearia TNT / clinic shape): the same two tables cover
// team members, gallery photos, reviews, stats and specialty chips — every
// one of them is structurally "a titled block containing an ordered list of
// items with some subset of {image, title, subtitle, body, extra}". See
// ARCHITECTURE.md for why this hybrid was chosen over per-block-type tables
// or a single JSON blob.
// ---------------------------------------------------------------------------

export const blocks = pgTable("blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  type: blockTypeEnum("type").notNull(),
  position: integer("position").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  settings: jsonb("settings").notNull().default({}),
});

export const blockItems = pgTable("block_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  blockId: uuid("block_id")
    .notNull()
    .references(() => blocks.id),
  position: integer("position").notNull().default(0),
  imageUrl: text("image_url"),
  title: text("title"),
  subtitle: text("subtitle"),
  body: text("body"),
  meta: jsonb("meta").notNull().default({}),
});
