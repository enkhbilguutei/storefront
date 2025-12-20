import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251216120000 extends Migration {

  override async up(): Promise<void> {
    // Add section column for product_grid banners to specify which section they belong to
    this.addSql(`alter table "banner" add column "section" text null;`);
  }

  override async down(): Promise<void> {
    // Remove section column
    this.addSql(`alter table "banner" drop column "section";`);
  }

}
