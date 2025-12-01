import { ExecArgs } from "@medusajs/framework/types";
import { IProductModuleService, IPricingModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import MeilisearchService from "../modules/meilisearch/service";
import { MEILISEARCH_MODULE } from "../modules/meilisearch";

export default async function indexProducts({ container }: ExecArgs) {
  console.log("Starting MeiliSearch product indexing...\n");

  const meilisearchService: MeilisearchService = container.resolve(MEILISEARCH_MODULE);
  const productService: IProductModuleService = container.resolve(Modules.PRODUCT);
  const pricingService: IPricingModuleService = container.resolve(Modules.PRICING);

  try {
    // Initialize the index with proper settings
    console.log("Initializing MeiliSearch index...");
    await meilisearchService.initializeIndex();

    // Clear existing documents
    console.log("Clearing existing documents...");
    await meilisearchService.deleteAllProducts();

    // Wait a moment for deletion to process
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Fetch all products with their variants and categories
    console.log("Fetching products from database...");
    const products = await productService.listProducts(
      {},
      {
        relations: ["variants", "categories", "collection"],
        take: 1000,
      }
    );

    console.log(`Found ${products.length} products to index\n`);

    // Get variant IDs to fetch prices
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variantIds = products.flatMap((p: any) => p.variants?.map((v: any) => v.id) || []);
    
    // Fetch prices for all variants from pricing module
    let variantPricesMap: Record<string, number[]> = {};
    if (variantIds.length > 0) {
      try {
        const priceSets = await pricingService.listPriceSets(
          {},
          { relations: ["prices"] }
        );
        
        // Build a map of variant_id -> prices
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        priceSets.forEach((priceSet: any) => {
          if (priceSet.prices) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            priceSet.prices.forEach((price: any) => {
              // Prices are linked via price_set_id
              const amount = price.amount;
              if (amount != null) {
                // We'll aggregate all prices by price_set for now
                if (!variantPricesMap[priceSet.id]) {
                  variantPricesMap[priceSet.id] = [];
                }
                variantPricesMap[priceSet.id].push(Number(amount));
              }
            });
          }
        });
      } catch (e) {
        console.log("Note: Could not fetch prices from pricing module:", e);
      }
    }

    // Transform products to MeiliSearch documents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const documents = products.map((product: any) => {
      // Collect all prices for this product's variants
      const allPrices: number[] = [];
      
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
        }) => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
        })),
        min_price: allPrices.length > 0 ? Math.min(...allPrices) : 0,
        max_price: allPrices.length > 0 ? Math.max(...allPrices) : 0,
        created_at: product.created_at,
        updated_at: product.updated_at,
      };
    });

    // Add products to MeiliSearch
    console.log("Indexing products in MeiliSearch...");
    await meilisearchService.addProducts(documents);

    // Wait for indexing to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get stats
    const stats = await meilisearchService.getStats();
    
    console.log("\n✅ Indexing complete!");
    console.log(`   Documents indexed: ${stats.numberOfDocuments}`);
    console.log(`   Is indexing: ${stats.isIndexing}`);
    console.log("\n📝 Products indexed:");
    documents.forEach((doc, i) => {
      console.log(`   ${i + 1}. ${doc.title} (${doc.handle})`);
    });

  } catch (error) {
    console.error("\n❌ Failed to index products:", error);
    throw error;
  }
}
