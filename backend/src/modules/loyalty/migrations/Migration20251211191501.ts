import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251211191501 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "loyalty_account" ("id" text not null, "customer_id" text not null, "points_balance" integer not null default 0, "total_earned" integer not null default 0, "total_redeemed" integer not null default 0, "tier" text not null default 'bronze', "birthday" timestamptz null, "birthday_reward_sent_year" integer null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "loyalty_account_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_account_deleted_at" ON "loyalty_account" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "loyalty_transaction" ("id" text not null, "loyalty_account_id" text not null, "points" integer not null, "type" text not null, "reason" text null, "order_id" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "loyalty_transaction_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_transaction_deleted_at" ON "loyalty_transaction" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "loyalty_account" cascade;`);

    this.addSql(`drop table if exists "loyalty_transaction" cascade;`);
  }

}
