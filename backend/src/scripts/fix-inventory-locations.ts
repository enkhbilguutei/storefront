import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import { createInventoryLevelsWorkflow } from "@medusajs/core-flows";

/**
 * Fix inventory items that are missing stock location associations
 * This assigns inventory levels to the default stock location
 * 
 * Run with: cd backend && pnpm medusa exec ./src/scripts/fix-inventory-locations.ts
 */
export default async function fixInventoryLocations({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const inventoryModuleService = container.resolve(Modules.INVENTORY);
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);

  logger.info("Checking for inventory items without stock locations...");

  // Get all stock locations to find the right one
  const allStockLocations = await stockLocationModuleService.listStockLocations({});
  
  if (!allStockLocations.length) {
    logger.error("No stock locations found! Please run the seed script first.");
    return;
  }

  // Try to find by name, otherwise use first one
  let stockLocation = allStockLocations.find((loc) => 
    loc.name?.includes("Улаанбаатар") || loc.name?.includes("агуулах")
  );

  if (!stockLocation) {
    logger.info(`Available stock locations: ${allStockLocations.map(l => l.name).join(", ")}`);
    stockLocation = allStockLocations[0];
    logger.info(`Using first available stock location: ${stockLocation.name}`);
  }
  logger.info(`Using stock location: ${stockLocation.id} (${stockLocation.name})`);

  // Get all inventory items
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
  });

  logger.info(`Found ${inventoryItems.length} total inventory items`);

  // Get existing inventory levels for this location
  const existingLevels = await inventoryModuleService.listInventoryLevels({
    location_id: stockLocation.id,
  });

  const existingLevelMap = new Set(existingLevels.map((l) => l.inventory_item_id));
  logger.info(`Found ${existingLevels.length} existing inventory levels at this location`);

  // Find items without levels
  const itemsWithoutLevels = inventoryItems.filter(
    (item) => !existingLevelMap.has(item.id)
  );

  logger.info(`Found ${itemsWithoutLevels.length} inventory items without levels`);

  if (itemsWithoutLevels.length === 0) {
    logger.info("All inventory items have stock levels! ✓");
    return;
  }

  logger.info("Inventory items without stock levels:");
  itemsWithoutLevels.slice(0, 10).forEach((item) => {
    logger.info(`  - ${item.sku || "no-sku"} [${item.id}]`);
  });
  if (itemsWithoutLevels.length > 10) {
    logger.info(`  ... and ${itemsWithoutLevels.length - 10} more`);
  }

  logger.info("\nCreating inventory levels for these items...");

  // Create inventory levels in batches
  const batchSize = 50;
  for (let i = 0; i < itemsWithoutLevels.length; i += batchSize) {
    const batch = itemsWithoutLevels.slice(i, i + batchSize);
    
    const inventoryLevels = batch.map((item) => ({
      location_id: stockLocation.id,
      stocked_quantity: 1000000, // Default large stock
      inventory_item_id: item.id,
    }));

    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryLevels,
      },
    });

    const processed = Math.min(i + batchSize, itemsWithoutLevels.length);
    logger.info(`Created ${processed}/${itemsWithoutLevels.length} inventory levels`);
  }

  logger.info("\n✓ Successfully created inventory levels for all items!");
  logger.info("You can now proceed with checkout without inventory location errors.");
}
