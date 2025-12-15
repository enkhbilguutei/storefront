import { cache } from "react";
import { getCategoryByHandle, type Category } from "@/lib/data/categories";

export const APPLE_ROOT_CATEGORY_HANDLES = ["iphone", "mac", "airpods"] as const;

const APPLE_HANDLE_KEYWORDS = [
  "iphone",
  "ipad",
  "watch",
  "apple-watch",
  "mac",
  "macbook",
  "imac",
  "airpods",
  "airpod",
] as const;

function looksLikeAppleHandle(handle: string) {
  const normalized = handle.toLowerCase();
  return (APPLE_HANDLE_KEYWORDS as readonly string[]).some((kw) => normalized.includes(kw));
}

function collectCategoryIds(category: Category, ids: Set<string>) {
  ids.add(category.id);

  if (!category.category_children) return;

  for (const child of category.category_children) {
    collectCategoryIds(child, ids);
  }
}

const getAppleCategoryIdSet = cache(async (): Promise<Set<string>> => {
  const ids = new Set<string>();

  for (const handle of APPLE_ROOT_CATEGORY_HANDLES) {
    const root = await getCategoryByHandle(handle);
    if (!root) continue;
    collectCategoryIds(root, ids);
  }

  return ids;
});

export async function isAppleCategoryId(categoryId: string): Promise<boolean> {
  const appleIds = await getAppleCategoryIdSet();
  return appleIds.has(categoryId);
}

export function isAppleCategoryHandle(handle: string): boolean {
  return looksLikeAppleHandle(handle);
}

export async function isAppleProduct(product: {
  handle?: string | null;
  title?: string | null;
  categories?: Array<{ id: string; handle?: string | null }> | null;
}): Promise<boolean> {
  const categories = product.categories ?? [];

  // Fast path from product handle/title (covers cases where categories aren't expanded).
  if (product.handle && looksLikeAppleHandle(product.handle)) {
    return true;
  }

  if (product.title && looksLikeAppleHandle(product.title)) {
    return true;
  }

  // Fast path if the API gives handles.
  for (const c of categories) {
    if (c.handle && looksLikeAppleHandle(c.handle)) {
      return true;
    }
  }

  const appleIds = await getAppleCategoryIdSet();
  return categories.some((c) => appleIds.has(c.id));
}
