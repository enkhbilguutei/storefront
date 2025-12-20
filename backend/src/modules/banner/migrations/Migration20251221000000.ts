import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251221000000 extends Migration {

  override async up(): Promise<void> {
    // Add grid_size column for bento_grid banners to specify tile size (1x1, 2x1, 2x2, 1x2)
    this.addSql(`alter table "banner" add column "grid_size" text not null default '1x1';`);
  }

  override async down(): Promise<void> {
    // Remove grid_size column
    this.addSql(`alter table "banner" drop column "grid_size";`);
  }

}
