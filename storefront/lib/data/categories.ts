import { medusa } from "@/lib/medusa";
import { cache } from "react";
import { getDefaultRegion } from "./regions";

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

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

// Cache the categories fetch to avoid multiple calls
export const getCategories = cache(async (): Promise<Category[]> => {
  try {
    // Use fetch directly since SDK doesn't have productCategory endpoint
    const response = await fetch(
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
    const response = await fetch(
      `${BACKEND_URL}/store/product-categories?handle=${handle}&include_descendants_tree=true&fields=id,name,handle,description,parent_category_id,category_children,metadata`,
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
      fields: "id,title,handle,thumbnail,options.*,options.values.*,variants.id,variants.title,variants.options.*,variants.prices.amount,variants.prices.currency_code,+variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder",
    };
    
    // Add region_id to get calculated prices with promotions
    if (region?.id) {
      query.region_id = region.id;
    }
    
    const { products } = await medusa.store.product.list(query);
    
    return products;
  } catch (error) {
    console.error("Failed to fetch products by category:", error);
    return [];
  }
});
