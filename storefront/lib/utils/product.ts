import { isProductInStock } from "./inventory";

/**
 * Price information for a product
 */
export interface PriceInfo {
  price: number;
  originalPrice?: number;
  isOnSale: boolean;
}

/**
 * Calculates price information from a product variant
 * @param variant - Product variant with pricing data
 * @returns Price information including sale status
 */
export function calculatePrice(variant: any): PriceInfo {
  const calculatedPrice = variant?.calculated_price;
  const price =
    calculatedPrice?.calculated_amount ?? variant?.prices?.[0]?.amount ?? 0;
  const originalPrice = calculatedPrice?.original_amount;
  const isOnSale =
    calculatedPrice &&
    calculatedPrice.calculated_amount < calculatedPrice.original_amount;

  return {
    price,
    originalPrice: isOnSale ? originalPrice : undefined,
    isOnSale: !!isOnSale,
  };
}

/**
 * Gets the first available variant from a product
 * @param product - Product with variants
 * @returns First variant or undefined
 */
export function getFirstVariant(product: any): any | undefined {
  return product?.variants?.[0];
}

/**
 * Transforms a product for display with price, stock, and metadata
 * @param product - Raw product data from API
 * @returns Transformed product with display-ready properties
 */
export function transformProductForDisplay(product: any): any {
  const variant = getFirstVariant(product);
  const priceInfo = calculatePrice(variant);
  const inStock = variant ? isProductInStock(variant) : false;

  return {
    ...product,
    variant,
    price: priceInfo.price,
    originalPrice: priceInfo.originalPrice,
    isOnSale: priceInfo.isOnSale,
    inStock,
    inventoryQuantity: variant?.inventory_quantity,
    manageInventory: variant?.manage_inventory,
    allowBackorder: variant?.allow_backorder,
  };
}

/**
 * Checks if a product is eligible for trade-in
 * @param product - Product with metadata
 * @returns true if trade-in eligible
 */
export function isTradeInEligible(product: any): boolean {
  return product?.metadata?.trade_in_eligible === true;
}

/**
 * Gets product thumbnail URL
 * @param product - Product with thumbnail
 * @returns Thumbnail URL or undefined
 */
export function getProductThumbnail(product: any): string | undefined {
  return product?.thumbnail;
}

/**
 * Gets product images array
 * @param product - Product with images
 * @returns Array of image objects
 */
export function getProductImages(product: any): any[] {
  return product?.images ?? [];
}
