import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251221000100 extends Migration {

  override async up(): Promise<void> {
    // Update default grid_size to match new 5-banner layout
    this.addSql(`alter table "banner" alter column "grid_size" set default '3x3';`);
  }

  override async down(): Promise<void> {
    // Revert to old default
    this.addSql(`alter table "banner" alter column "grid_size" set default '1x1';`);
  }

}
