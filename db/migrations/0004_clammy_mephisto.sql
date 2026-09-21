CREATE TYPE "public"."product_condition" AS ENUM('lacrado', 'seminovo', 'cpo');--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"color" text NOT NULL,
	"storage_label" text,
	"price_cents" integer NOT NULL,
	"image_urls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "category_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "condition" "product_condition";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "grade" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "battery_health_pct" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "included_items" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "storefront_settings" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;