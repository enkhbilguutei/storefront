import { medusa } from "@/lib/medusa";
import { cache } from "react";
import { getDefaultRegion } from "./regions";

interface HomePageProduct {
  id: string; // variant ID for cart
  title: string;
  handle: string;
  thumbnail?: string;
  tradeInEligible?: boolean;
  price?: {
    amount: number;
    currencyCode: string;
  };
  originalPrice?: {
    amount: number;
    currencyCode: string;
  };
  inventoryQuantity?: number | null;
  manageInventory?: boolean | null;
  allowBackorder?: boolean | null;
}

/**
 * Transform Medusa product to HomePage product format
 * Uses the first variant for pricing
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformProduct(product: any): HomePageProduct | null {
  const firstVariant = product.variants?.[0];
  if (!firstVariant) return null;

  const price = firstVariant.prices?.[0];
  const calculatedPrice = firstVariant.calculated_price;

  return {
    id: firstVariant.id, // Use variant ID for cart functionality
    title: product.title,
    handle: product.handle,
    thumbnail: product.thumbnail || undefined,
    tradeInEligible: Boolean(product?.metadata?.trade_in_eligible),
    price: price ? {
      amount: calculatedPrice?.calculated_amount || price.amount,
      currencyCode: price.currency_code.toUpperCase(),
    } : undefined,
    originalPrice: calculatedPrice?.original_amount && calculatedPrice.original_amount > (calculatedPrice.calculated_amount || price?.amount || 0) ? {
      amount: calculatedPrice.original_amount,
      currencyCode: price?.currency_code.toUpperCase() || 'MNT',
    } : undefined,
    inventoryQuantity: firstVariant.inventory_quantity ?? null,
    manageInventory: firstVariant.manage_inventory ?? null,
    allowBackorder: firstVariant.allow_backorder ?? null,
  };
}

/**
 * Get products with optional filters
 */
export const getProducts = cache(async (options?: {
  categoryId?: string;
  limit?: number;
  offset?: number;
  fields?: string;
}) => {
  try {
    const region = await getDefaultRegion();
    
    const query: {
      limit: number;
      offset?: number;
      fields: string;
      region_id?: string;
      category_id?: string[];
    } = {
      limit: options?.limit || 20,
      offset: options?.offset || 0,
      fields:
        options?.fields ||
        "id,title,handle,thumbnail,metadata,options.*,options.values.*,variants.id,variants.title,variants.options.*,variants.prices.amount,variants.prices.currency_code,+variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder",
    };
    
    if (region?.id) {
      query.region_id = region.id;
    }
    
    if (options?.categoryId) {
      query.category_id = [options.categoryId];
    }
    
    const { products } = await medusa.store.product.list(query);
    
    // Transform products for homepage display
    return products
      .map(transformProduct)
      .filter((p): p is HomePageProduct => p !== null);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
});

/**
 * Get featured/latest products for homepage
 */
export const getFeaturedProducts = cache(async (limit: number = 12) => {
  return getProducts({ limit });
});
