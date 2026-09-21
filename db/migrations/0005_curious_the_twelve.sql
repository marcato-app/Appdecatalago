CREATE TABLE "iphone_catalog_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"specs_text" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "iphone_catalog_models_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "iphone_catalog_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" uuid NOT NULL,
	"color" text NOT NULL,
	"storage_label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "iphone_catalog_variants" ADD CONSTRAINT "iphone_catalog_variants_model_id_iphone_catalog_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."iphone_catalog_models"("id") ON DELETE no action ON UPDATE no action;