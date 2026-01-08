import { medusa } from "@/lib/medusa";
import { cache } from "react";
import { getDefaultRegion } from "./regions";
import { API_URL, API_KEY } from "@/lib/config/api";

interface ColorVariant {
  value: string;
  hex?: string;
}

// Transform product for home page display
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformProduct(product: any) {
  const firstVariant = product.variants?.[0];
  if (!firstVariant) return null;

  const price = firstVariant.prices?.[0];
  const calculatedPrice = firstVariant.calculated_price;

  // Extract unique colors from product options
  const colorOption = product.options?.find((opt: any) => 
    opt.title?.toLowerCase() === 'color' || opt.title?.toLowerCase() === 'өнгө'
  );
  
  const colors: ColorVariant[] = colorOption?.values?.map((val: any) => ({
    value: val.value || val,
  })) || [];

  // Get rating from metadata
  const rating = product.metadata?.rating ? parseFloat(product.metadata.rating) : undefined;
  const reviewCount = product.metadata?.review_count ? parseInt(product.metadata.review_count) : undefined;

  return {
    id: firstVariant.id,
    productId: product.id,
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
    rating,
    reviewCount,
    colors,
  };
}

export interface Category {
  id: string;
  name: string;
  handle: string;
  description?: string | null;
  parent_category_id?: string | null;
  parent_category?: Category | null;
  category_children?: Category[] | null;
  metadata?: Record<string, unknown> | null;
}

const BACKEND_URL = API_URL;
const PUBLISHABLE_KEY = API_KEY;
const DEFAULT_FETCH_TIMEOUT_MS = 8000;
const FETCH_TIMEOUT_MS = Number(
  process.env.NEXT_PUBLIC_STOREFRONT_FETCH_TIMEOUT_MS ??
    process.env.STOREFRONT_FETCH_TIMEOUT_MS ??
    DEFAULT_FETCH_TIMEOUT_MS
);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(
  input: string,
  init: Omit<RequestInit, "signal"> & { signal?: AbortSignal },
  opts?: {
    timeoutMs?: number;
    retries?: number;
    retryDelayMs?: number;
  }
) {
  const timeoutMs = opts?.timeoutMs ?? FETCH_TIMEOUT_MS;
  const retries = opts?.retries ?? 2;
  const retryDelayMs = opts?.retryDelayMs ?? 250;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(input, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
      });
      return response;
    } catch (error) {
      lastError = error;
      if (attempt >= retries) break;
      await sleep(retryDelayMs * Math.pow(2, attempt));
    }
  }

  throw lastError;
}

async function warmBackendConnection() {
  try {
    await fetch(`${BACKEND_URL}/store/warm`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      signal: AbortSignal.timeout(1500),
      // Don’t cache the warmup request.
      cache: "no-store",
    });
  } catch {
    // best-effort
  }
}

// Cache the categories fetch to avoid multiple calls
export const getCategories = cache(async (): Promise<Category[]> => {
  try {
    await warmBackendConnection();
    // Use fetch directly since SDK doesn't have productCategory endpoint
    const response = await fetchWithRetry(
      `${BACKEND_URL}/store/product-categories?include_descendants_tree=true&fields=id,name,handle,description,parent_category_id,category_children,metadata,*category_children`,
      {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_KEY,
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const { product_categories } = await response.json();
    
    // Filter to only get root categories (no parent)
    const rootCategories = product_categories.filter(
      (cat: Category) => !cat.parent_category_id
    );
    
    return rootCategories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
});

export const getCategoryByHandle = cache(async (handle: string): Promise<Category | null> => {
  try {
    await warmBackendConnection();
    const response = await fetchWithRetry(
      `${BACKEND_URL}/store/product-categories?handle=${handle}&include_descendants_tree=true&fields=id,name,handle,description,parent_category_id,category_children,metadata,*category_children`,
      {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_KEY,
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch category: ${response.statusText}`);
    }

    const { product_categories } = await response.json();
    return product_categories[0] || null;
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return null;
  }
});

// Helper function to get all descendant category IDs
function getAllCategoryIds(category: Category): string[] {
  const ids = [category.id];
  
  if (category.category_children && category.category_children.length > 0) {
    for (const child of category.category_children) {
      ids.push(...getAllCategoryIds(child));
    }
  }
  
  return ids;
}

export const getProductsByCategory = cache(async (categoryId: string) => {
  try {
    // Get default region for calculated prices (promotions)
    const region = await getDefaultRegion();
    
    // First, get the category with its descendants to include all subcategory products
    const response = await fetch(
      `${BACKEND_URL}/store/product-categories?id=${categoryId}&include_descendants_tree=true&fields=id,category_children.*`,
      {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_KEY,
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch category: ${response.statusText}`);
    }

    const { product_categories } = await response.json();
    const category = product_categories[0];
    
    if (!category) {
      return [];
    }
    
    // Get all category IDs including descendants
    const categoryIds = getAllCategoryIds(category);
    
    const query: {
      category_id: string[];
      limit: number;
      fields: string;
      region_id?: string;
    } = {
      category_id: categoryIds,
      limit: 50,
      fields: "id,title,handle,thumbnail,metadata,options.*,options.values.*,variants.id,variants.title,variants.options.*,variants.prices.amount,variants.prices.currency_code,+variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder",
    };
    
    // Add region_id to get calculated prices with promotions
    if (region?.id) {
      query.region_id = region.id;
    }
    
    const { products } = await medusa.store.product.list(query);
    
    // Transform products for homepage display
    return products
      .map(transformProduct)
      .filter((p) => p !== null);
  } catch (error) {
    console.error("Failed to fetch products by category:", error);
    return [];
  }
});
