import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251210081000 extends Migration {

  override async up(): Promise<void> {
    // Add mobile_image_url column for mobile-optimized hero images
    this.addSql(`alter table "banner" add column "mobile_image_url" text null;`);
  }

  override async down(): Promise<void> {
    // Remove mobile_image_url column
    this.addSql(`alter table "banner" drop column "mobile_image_url";`);
  }

}
