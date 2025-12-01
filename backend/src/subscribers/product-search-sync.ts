import { type SubscriberConfig, type SubscriberArgs } from "@medusajs/framework";
import { IProductModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import MeilisearchService from "../modules/meilisearch/service";
import { MEILISEARCH_MODULE } from "../modules/meilisearch";

interface ProductEventData {
  id: string;
}

async function transformProductToDocument(
  productService: IProductModuleService,
  productId: string
) {
  const products = await productService.listProducts(
    { id: productId },
    {
      relations: ["variants", "variants.prices", "categories", "collection"],
    }
  );

  if (products.length === 0) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product: any = products[0];
  const prices = product.variants
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?.flatMap((v: any) => v.prices || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((p: any) => p.amount)
    .filter(Boolean) || [];

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    thumbnail: product.thumbnail,
    collection_id: product.collection?.id || null,
    collection_title: product.collection?.title || null,
    category_ids: product.categories?.map((c: { id: string }) => c.id) || [],
    category_names: product.categories?.map((c: { name: string }) => c.name) || [],
    tags: product.tags?.map((t: { value: string }) => t.value) || [],
    variants: product.variants?.map((v: {
      id: string;
      title: string;
      sku?: string | null;
      prices?: { amount: number; currency_code: string }[];
    }) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      prices: v.prices?.map((p) => ({
        amount: p.amount,
        currency_code: p.currency_code,
      })),
    })),
    min_price: prices.length > 0 ? Math.min(...prices) : 0,
    max_price: prices.length > 0 ? Math.max(...prices) : 0,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
}

// Handle product created event
export async function handleProductCreated({
  event: { data },
  container,
}: SubscriberArgs<ProductEventData>) {
  try {
    const meilisearchService: MeilisearchService = container.resolve(MEILISEARCH_MODULE);
    const productService: IProductModuleService = container.resolve(Modules.PRODUCT);

    const document = await transformProductToDocument(productService, data.id);
    if (document) {
      await meilisearchService.addProduct(document);
      console.log(`[MeiliSearch] Indexed new product: ${data.id}`);
    }
  } catch (error) {
    console.error(`[MeiliSearch] Failed to index product ${data.id}:`, error);
  }
}

// Handle product updated event
export async function handleProductUpdated({
  event: { data },
  container,
}: SubscriberArgs<ProductEventData>) {
  try {
    const meilisearchService: MeilisearchService = container.resolve(MEILISEARCH_MODULE);
    const productService: IProductModuleService = container.resolve(Modules.PRODUCT);

    const document = await transformProductToDocument(productService, data.id);
    if (document) {
      await meilisearchService.addProduct(document);
      console.log(`[MeiliSearch] Updated product: ${data.id}`);
    }
  } catch (error) {
    console.error(`[MeiliSearch] Failed to update product ${data.id}:`, error);
  }
}

// Handle product deleted event
export async function handleProductDeleted({
  event: { data },
  container,
}: SubscriberArgs<ProductEventData>) {
  try {
    const meilisearchService: MeilisearchService = container.resolve(MEILISEARCH_MODULE);
    await meilisearchService.deleteProduct(data.id);
    console.log(`[MeiliSearch] Deleted product: ${data.id}`);
  } catch (error) {
    console.error(`[MeiliSearch] Failed to delete product ${data.id}:`, error);
  }
}

// Default export for product.created
export default handleProductCreated;

export const config: SubscriberConfig = {
  event: "product.created",
};
