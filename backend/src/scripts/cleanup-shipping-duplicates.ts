import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

/**
 * Cleanup duplicate shipping options - keeps only one of each unique name
 * 
 * Run with: medusa exec ./src/scripts/cleanup-shipping-duplicates.ts
 */
export default async function cleanupShippingDuplicates({ container }: ExecArgs) {
  const fulfillmentService = container.resolve(Modules.FULFILLMENT);
  
  console.log("\n=== Cleaning up duplicate shipping options ===\n");
  
  const options = await fulfillmentService.listShippingOptions({});
  console.log(`Found ${options.length} total shipping options`);
  
  // Group by name
  const optionsByName = new Map<string, any[]>();
  for (const opt of options) {
    const existing = optionsByName.get(opt.name) || [];
    existing.push(opt);
    optionsByName.set(opt.name, existing);
  }
  
  // Find duplicates and delete them
  let deletedCount = 0;
  for (const [name, opts] of optionsByName) {
    if (opts.length > 1) {
      console.log(`\n"${name}" has ${opts.length} duplicates:`);
      // Keep the first one, delete the rest
      const [keep, ...toDelete] = opts;
      console.log(`  Keeping: ${keep.id}`);
      
      for (const opt of toDelete) {
        console.log(`  Deleting: ${opt.id}`);
        try {
          await fulfillmentService.deleteShippingOptions([opt.id]);
          deletedCount++;
        } catch (error) {
          console.error(`  Error deleting ${opt.id}:`, error);
        }
      }
    }
  }
  
  console.log(`\n=== Cleanup complete ===`);
  console.log(`Deleted ${deletedCount} duplicate shipping options`);
  
  // Show remaining options
  const remainingOptions = await fulfillmentService.listShippingOptions({});
  console.log(`\nRemaining shipping options (${remainingOptions.length}):`);
  remainingOptions.forEach((o: any) => {
    console.log(`  - ${o.name} (ID: ${o.id})`);
  });
}
