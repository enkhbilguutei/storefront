/**
 * Inventory information for a product variant
 */
export interface InventoryInfo {
  inventoryQuantity?: number | null;
  manageInventory?: boolean;
  allowBackorder?: boolean;
}

/**
 * Checks if a product variant is in stock
 * @param variant - Product variant with inventory information
 * @returns true if product is in stock or allows backorder
 */
export function isProductInStock(variant: InventoryInfo): boolean {
  const { inventoryQuantity, manageInventory, allowBackorder } = variant;

  // If inventory is not managed, always in stock
  if (!manageInventory) {
    return true;
  }

  // If backorders are allowed, always in stock
  if (allowBackorder) {
    return true;
  }

  // Check actual inventory quantity
  return inventoryQuantity !== null && inventoryQuantity !== undefined && inventoryQuantity > 0;
}

/**
 * Gets stock status label in Mongolian
 * @param variant - Product variant with inventory information
 * @returns Stock status label
 */
export function getStockStatusLabel(variant: InventoryInfo): string {
  if (isProductInStock(variant)) {
    return "Нөөцтэй";
  }
  return "Дууссан";
}
