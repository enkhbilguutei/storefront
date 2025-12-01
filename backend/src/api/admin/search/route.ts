import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import MeilisearchService from "../../../modules/meilisearch/service";
import { MEILISEARCH_MODULE } from "../../../modules/meilisearch";
import { IProductModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

/**
 * GET /admin/search
 * Get MeiliSearch index stats
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const meilisearchService: MeilisearchService = req.scope.resolve(MEILISEARCH_MODULE);

    const [health, stats] = await Promise.all([
      meilisearchService.getHealth(),
      meilisearchService.getStats(),
    ]);

    res.json({
      status: health.status,
      numberOfDocuments: stats.numberOfDocuments,
      isIndexing: stats.isIndexing,
    });
  } catch (error) {
    console.error("Failed to get MeiliSearch stats:", error);
    res.status(500).json({
      error: "Failed to get search stats",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * POST /admin/search
 * Reindex all products in MeiliSearch
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const meilisearchService: MeilisearchService = req.scope.resolve(MEILISEARCH_MODULE);
    const productService: IProductModuleService = req.scope.resolve(Modules.PRODUCT);

    // Initialize the index with proper settings
    await meilisearchService.initializeIndex();

    // Clear existing documents
    await meilisearchService.deleteAllProducts();

    // Fetch all products with their variants and categories
    const products = await productService.listProducts(
      {},
      {
        relations: ["variants", "variants.prices", "categories", "collection"],
        take: 1000, // Adjust based on your catalog size
      }
    );

    // Transform products to MeiliSearch documents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const documents = products.map((product: any) => {
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
    });

    // Add products to MeiliSearch
    await meilisearchService.addProducts(documents);

    res.json({
      success: true,
      message: `Indexed ${documents.length} products`,
      count: documents.length,
    });
  } catch (error) {
    console.error("Failed to index products:", error);
    res.status(500).json({
      error: "Failed to index products",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
