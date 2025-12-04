import { medusa } from "@/lib/medusa";
import { cache } from "react";

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

// Cache the categories fetch to avoid multiple calls
export const getCategories = cache(async (): Promise<Category[]> => {
  try {
    const { product_categories } = await medusa.store.category.list({
      include_descendants_tree: true,
      fields: "id,name,handle,description,parent_category_id,category_children,metadata,*category_children",
    });
    
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
    const { product_categories } = await medusa.store.category.list({
      handle: [handle],
      include_descendants_tree: true,
      fields: "id,name,handle,description,parent_category_id,category_children,metadata",
    });
    
    return product_categories[0] || null;
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return null;
  }
});

export const getProductsByCategory = cache(async (categoryId: string) => {
  try {
    const { products } = await medusa.store.product.list({
      category_id: [categoryId],
      limit: 50,
      fields: "id,title,handle,thumbnail,options.*,options.values.*,variants.id,variants.title,variants.options.*,variants.prices.amount,variants.prices.currency_code,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder",
    });
    
    return products;
  } catch (error) {
    console.error("Failed to fetch products by category:", error);
    return [];
  }
});
