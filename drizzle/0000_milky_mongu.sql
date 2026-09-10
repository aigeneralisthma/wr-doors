CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text,
	"role" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email"),
	CONSTRAINT "admin_users_role_check" CHECK ("admin_users"."role" IN ('admin'))
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"service" text NOT NULL,
	"area" text NOT NULL,
	"preferred_date" date NOT NULL,
	"preferred_time_slot" text,
	"duration_minutes" integer,
	"notes" text,
	"locale" text DEFAULT 'en' NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"assigned_technician" uuid,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_service_check" CHECK ("bookings"."service" IN ('consultation', 'installation', 'technician', 'custom')),
	CONSTRAINT "bookings_locale_check" CHECK ("bookings"."locale" IN ('en', 'ar')),
	CONSTRAINT "bookings_status_check" CHECK ("bookings"."status" IN ('new', 'confirmed', 'in_progress', 'completed', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text NOT NULL,
	"subject" text,
	"product" text,
	"quantity" text,
	"location" text,
	"budget" text,
	"message" text NOT NULL,
	"locale" text DEFAULT 'en' NOT NULL,
	"source" text DEFAULT 'contact' NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leads_locale_check" CHECK ("leads"."locale" IN ('en', 'ar')),
	CONSTRAINT "leads_source_check" CHECK ("leads"."source" IN ('quote', 'contact', 'product-page')),
	CONSTRAINT "leads_status_check" CHECK ("leads"."status" IN ('new', 'contacted', 'converted', 'lost'))
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ar" text NOT NULL,
	"category" text NOT NULL,
	"category_en" text NOT NULL,
	"category_ar" text NOT NULL,
	"description_en" text NOT NULL,
	"description_ar" text NOT NULL,
	"price_from_aed" integer,
	"images" text[] DEFAULT '{}'::text[] NOT NULL,
	"specs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_category_check" CHECK ("products"."category" IN ('wpc-doors', 'pivot-aluminium-doors', 'sliding-systems', 'wall-cladding'))
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"title_en" text NOT NULL,
	"title_ar" text NOT NULL,
	"location_en" text NOT NULL,
	"location_ar" text NOT NULL,
	"description_en" text NOT NULL,
	"description_ar" text NOT NULL,
	"images" text[] DEFAULT '{}'::text[] NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug"),
	CONSTRAINT "projects_category_check" CHECK ("projects"."category" IN ('residential', 'commercial', 'luxury'))
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value_en" text,
	"value_ar" text,
	"value_json" jsonb,
	"type" text DEFAULT 'text' NOT NULL,
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_type_check" CHECK ("site_settings"."type" IN ('text', 'image', 'video', 'json'))
);
--> statement-breakpoint
CREATE TABLE "technicians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"skills" text[] DEFAULT '{}'::text[] NOT NULL,
	"hourly_rate_aed" integer,
	"availability" jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "technicians_status_check" CHECK ("technicians"."status" IN ('active', 'inactive', 'on_leave'))
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assigned_technician_technicians_id_fk" FOREIGN KEY ("assigned_technician") REFERENCES "public"."technicians"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bookings_status" ON "bookings" USING btree ("status","preferred_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_bookings_service" ON "bookings" USING btree ("service");--> statement-breakpoint
CREATE INDEX "idx_bookings_technician" ON "bookings" USING btree ("assigned_technician") WHERE "bookings"."assigned_technician" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_bookings_date" ON "bookings" USING btree ("preferred_date");--> statement-breakpoint
CREATE INDEX "idx_leads_status" ON "leads" USING btree ("status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_leads_source" ON "leads" USING btree ("source","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_leads_locale" ON "leads" USING btree ("locale");--> statement-breakpoint
CREATE INDEX "idx_products_category" ON "products" USING btree ("category") WHERE "products"."is_active" = true;--> statement-breakpoint
CREATE INDEX "idx_products_featured" ON "products" USING btree ("is_featured") WHERE "products"."is_featured" = true AND "products"."is_active" = true;--> statement-breakpoint
CREATE INDEX "idx_products_slug_active" ON "products" USING btree ("slug") WHERE "products"."is_active" = true;--> statement-breakpoint
CREATE INDEX "idx_projects_category" ON "projects" USING btree ("category") WHERE "projects"."is_published" = true;--> statement-breakpoint
CREATE INDEX "idx_projects_order" ON "projects" USING btree ("display_order") WHERE "projects"."is_published" = true;--> statement-breakpoint
CREATE INDEX "idx_technicians_status" ON "technicians" USING btree ("status");--> statement-breakpoint
CREATE OR REPLACE FUNCTION refresh_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION refresh_updated_at();--> statement-breakpoint
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION refresh_updated_at();--> statement-breakpoint
CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION refresh_updated_at();--> statement-breakpoint
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION refresh_updated_at();--> statement-breakpoint
CREATE TRIGGER trg_technicians_updated_at BEFORE UPDATE ON technicians FOR EACH ROW EXECUTE FUNCTION refresh_updated_at();--> statement-breakpoint
CREATE TRIGGER trg_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION refresh_updated_at();--> statement-breakpoint
CREATE TRIGGER trg_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION refresh_updated_at();