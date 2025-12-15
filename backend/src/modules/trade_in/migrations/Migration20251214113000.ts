import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20251214113000 extends Migration {
  override async up(): Promise<void> {
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
  }

  override async down(): Promise<void> {
    this.addSql('drop table if exists "trade_in_device_map" cascade;')
  }
}
