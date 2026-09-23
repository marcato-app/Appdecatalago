CREATE TYPE "public"."product_line" AS ENUM('iphone', 'watch', 'airpods', 'ipad', 'mac');--> statement-breakpoint
ALTER TABLE "iphone_catalog_models" ADD COLUMN "product_line" "product_line" DEFAULT 'iphone' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "product_line" "product_line" DEFAULT 'iphone' NOT NULL;