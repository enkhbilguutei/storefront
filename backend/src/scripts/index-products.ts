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

    // Fetch price sets with prices to derive variant prices
    const priceSets = await pricingService.listPriceSets({}, { relations: ["prices"] });

    const priceSetMap = new Map<string, number[]>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (priceSets as any[]).forEach((priceSet) => {
      const amounts = (priceSet.prices || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((p: any) => Number(p.amount))
        .filter((amount: number) => !Number.isNaN(amount));
      priceSetMap.set(priceSet.id, amounts);
    });

    // Transform products to MeiliSearch documents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const documents = products.map((product: any) => {
      const variantEntries = (product.variants || []).map((variant: any) => {
        const amounts = priceSetMap.get(variant.price_set_id) || [];
        return {
          id: variant.id,
          title: variant.title,
          sku: variant.sku,
          prices: amounts.map((amount) => ({ amount, currency_code: "mnt" })),
        };
      });

      const allPrices = variantEntries.flatMap((v) => v.prices?.map((p) => p.amount) || []);

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
        variants: variantEntries,
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
