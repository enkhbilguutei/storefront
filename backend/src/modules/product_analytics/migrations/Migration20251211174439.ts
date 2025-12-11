import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251211174439 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_review" ("id" text not null, "product_id" text not null, "customer_id" text not null, "customer_name" text not null, "rating" integer not null, "title" text null, "comment" text not null, "photos" jsonb null, "verified_purchase" boolean not null default false, "is_approved" boolean not null default false, "helpful_count" integer not null default 0, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_review_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_review_deleted_at" ON "product_review" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "product_sale" ("id" text not null, "product_id" text not null, "order_id" text not null, "quantity" integer not null, "sold_at" timestamptz not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_sale_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_sale_deleted_at" ON "product_sale" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "product_view" ("id" text not null, "product_id" text not null, "customer_id" text null, "session_id" text null, "ip_address" text null, "viewed_at" timestamptz not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_view_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_view_deleted_at" ON "product_view" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_review" cascade;`);

    this.addSql(`drop table if exists "product_sale" cascade;`);

    this.addSql(`drop table if exists "product_view" cascade;`);
  }

}
