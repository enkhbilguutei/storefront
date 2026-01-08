import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createInventoryLevelsWorkflow } from "@medusajs/core-flows";

/**
 * Subscriber that ensures newly created variants have inventory levels at stock locations
 * This prevents checkout errors from variants without inventory tracking
 */
export default async function ensureInventoryLevel({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; product_id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const inventoryModuleService = container.resolve(Modules.INVENTORY);
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);

  const variantId = data.id;

  try {
    // Get inventory item linked to this variant
    const { data: variantInventoryItems } = await query.graph({
      entity: "variant_inventory_item_link",
      fields: ["variant_id", "inventory_item_id"],
      filters: {
        variant_id: variantId,
      },
    });

    if (!variantInventoryItems.length) {
      // No inventory item linked yet - this is normal for some workflows
      return;
    }

    const inventoryItemId = variantInventoryItems[0].inventory_item_id;

    // Check if inventory item has any levels
    const existingLevels = await inventoryModuleService.listInventoryLevels({
      inventory_item_id: inventoryItemId,
    });

    if (existingLevels.length > 0) {
      // Already has inventory levels
      return;
    }

    logger.info(`Variant ${variantId} has no inventory levels. Auto-creating...`);

    // Get all stock locations
    const stockLocations = await stockLocationModuleService.listStockLocations({});

    if (!stockLocations.length) {
      logger.error("No stock locations found. Cannot create inventory level.");
      return;
    }

    // Use first stock location (typically the default/main warehouse)
    const stockLocation = stockLocations[0];

    // Create inventory level
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: [
          {
            location_id: stockLocation.id,
            stocked_quantity: 1000000, // Default large stock
            inventory_item_id: inventoryItemId,
          },
        ],
      },
    });

    logger.info(`✓ Created inventory level for variant ${variantId} at ${stockLocation.name}`);
  } catch (error) {
    logger.error(`Failed to auto-create inventory level for variant ${variantId}:`, error);
  }
}

export const config: SubscriberConfig = {
  event: "product-variant.created",
};
