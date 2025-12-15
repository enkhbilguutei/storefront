import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20251214100000 extends Migration {
  override async up(): Promise<void> {
    // Ensure trade_in_offer table exists (used to store pricing matrix)
    this.addSql(`create table if not exists "trade_in_offer" (
      "id" text not null,
      "brand" text not null default 'apple',
      "device_type" text null,
      "model_keyword" text not null,
      "condition" text not null,
      "amount" numeric not null,
      "currency_code" text not null default 'mnt',
      "active" boolean not null default true,
      "priority" integer not null default 0,
      "metadata" jsonb null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "trade_in_offer_pkey" primary key ("id")
    );`)
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_trade_in_offer_deleted_at" ON "trade_in_offer" ("deleted_at") WHERE deleted_at IS NULL;`
    )

    // TAC → model keyword mapping (serial/IMEI resolution)
    this.addSql(`create table if not exists "trade_in_device_map" (
      "id" text not null,
      "tac_prefix" text not null,
      "brand" text not null default 'apple',
      "device_type" text null,
      "model_keyword" text not null,
      "priority" integer not null default 0,
      "active" boolean not null default true,
      "metadata" jsonb null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "trade_in_device_map_pkey" primary key ("id")
    );`)
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_trade_in_device_map_tac" ON "trade_in_device_map" ("tac_prefix") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_trade_in_device_map_deleted_at" ON "trade_in_device_map" ("deleted_at") WHERE deleted_at IS NULL;`
    )

    // Ensure trade_in_request table exists with serial_number captured
    this.addSql(`create table if not exists "trade_in_request" (
      "id" text not null,
      "new_product_id" text null,
      "new_product_handle" text null,
      "new_product_title" text null,
      "cart_id" text null,
      "order_id" text null,
      "estimated_amount" numeric null,
      "final_amount" numeric null,
      "currency_code" text not null default 'mnt',
      "promotion_code" text null,
      "customer_name" text null,
      "phone" text null,
      "old_device_model" text not null,
      "old_device_condition" text not null,
      "note" text null,
      "status" text not null default 'new',
      "metadata" jsonb null,
      "serial_number" text null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "trade_in_request_pkey" primary key ("id")
    );`)
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_trade_in_request_deleted_at" ON "trade_in_request" ("deleted_at") WHERE deleted_at IS NULL;`
    )

    // For databases where the table already exists, add serial_number if missing
    this.addSql('alter table "trade_in_request" add column if not exists "serial_number" text null;')
  }

  override async down(): Promise<void> {
    this.addSql('drop table if exists "trade_in_device_map" cascade;')
    this.addSql('alter table "trade_in_request" drop column if exists "serial_number";')
    this.addSql('drop table if exists "trade_in_request" cascade;')
    this.addSql('drop table if exists "trade_in_offer" cascade;')
  }
}
