import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251210080000 extends Migration {

  override async up(): Promise<void> {
    // Make title column nullable to match model definition
    this.addSql(`alter table "banner" alter column "title" drop not null;`);
  }

  override async down(): Promise<void> {
    // Revert: make title required again
    this.addSql(`alter table "banner" alter column "title" set not null;`);
  }

}
