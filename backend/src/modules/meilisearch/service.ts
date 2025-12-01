interface SearchResponse<T> {
  hits: T[];
  query: string;
  processingTimeMs: number;
  limit?: number;
  offset?: number;
  estimatedTotalHits?: number;
}

interface SearchParams {
  limit?: number;
  offset?: number;
  filter?: string | string[];
  sort?: string[];
  attributesToHighlight?: string[];
  attributesToRetrieve?: string[];
}

interface MeilisearchConfig {
  host: string;
  apiKey?: string;
}

interface ProductDocument {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  thumbnail?: string | null;
  collection_id?: string | null;
  collection_title?: string | null;
  category_ids?: string[];
  category_names?: string[];
  tags?: string[];
  variants?: {
    id: string;
    title: string;
    sku?: string | null;
    prices?: {
      amount: number;
      currency_code: string;
    }[];
  }[];
  min_price?: number;
  max_price?: number;
  created_at?: string;
  updated_at?: string;
}

const PRODUCTS_INDEX = "products";

// Medusa module container type
type ModuleOptions = {
  host?: string;
  apiKey?: string;
};

type InjectedDependencies = {
  // Medusa injects container dependencies here
};

export default class MeilisearchService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client_: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private productsIndex_: any;
  private config_: MeilisearchConfig;
  private initialized_: boolean = false;

  // Medusa modules receive ({ }, options) - first arg is container, second is options
  constructor(_: InjectedDependencies, options?: ModuleOptions) {
    this.config_ = {
      host: options?.host || process.env.MEILISEARCH_HOST || "http://localhost:7700",
      apiKey: options?.apiKey || process.env.MEILISEARCH_API_KEY,
    };
  }

  /**
   * Lazily initialize the MeiliSearch client
   */
  private async getClient() {
    if (!this.client_) {
      const { MeiliSearch } = await import("meilisearch");
      this.client_ = new MeiliSearch({
        host: this.config_.host,
        apiKey: this.config_.apiKey,
      });
    }
    return this.client_;
  }

  /**
   * Get the products index
   */
  private async getProductsIndex() {
    if (!this.productsIndex_) {
      const client = await this.getClient();
      this.productsIndex_ = client.index(PRODUCTS_INDEX);
    }
    return this.productsIndex_;
  }

  /**
   * Initialize the products index with proper settings
   */
  async initializeIndex(): Promise<void> {
    if (this.initialized_) return;

    try {
      const client = await this.getClient();
      
      // Create index if it doesn't exist
      try {
        await client.createIndex(PRODUCTS_INDEX, { primaryKey: "id" });
      } catch {
        // Index might already exist, that's fine
      }

      const productsIndex = await this.getProductsIndex();

      // Configure searchable attributes
      await productsIndex.updateSearchableAttributes([
        "title",
        "description",
        "handle",
        "collection_title",
        "category_names",
        "tags",
        "variants.title",
        "variants.sku",
      ]);

      // Configure filterable attributes
      await productsIndex.updateFilterableAttributes([
        "collection_id",
        "category_ids",
        "min_price",
        "max_price",
        "tags",
      ]);

      // Configure sortable attributes
      await productsIndex.updateSortableAttributes([
        "title",
        "min_price",
        "max_price",
        "created_at",
        "updated_at",
      ]);

      // Configure ranking rules
      await productsIndex.updateRankingRules([
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness",
      ]);

      // Configure displayed attributes (what gets returned)
      await productsIndex.updateDisplayedAttributes([
        "id",
        "title",
        "handle",
        "description",
        "thumbnail",
        "collection_id",
        "collection_title",
        "category_ids",
        "category_names",
        "tags",
        "variants",
        "min_price",
        "max_price",
      ]);

      this.initialized_ = true;
      console.log("MeiliSearch products index initialized successfully");
    } catch (error) {
      console.error("Failed to initialize MeiliSearch index:", error);
      throw error;
    }
  }

  /**
   * Add or update a single product in the index
   */
  async addProduct(product: ProductDocument): Promise<void> {
    const index = await this.getProductsIndex();
    await index.addDocuments([product]);
  }

  /**
   * Add or update multiple products in the index
   */
  async addProducts(products: ProductDocument[]): Promise<void> {
    if (products.length === 0) return;
    const index = await this.getProductsIndex();
    await index.addDocuments(products);
  }

  /**
   * Delete a product from the index
   */
  async deleteProduct(productId: string): Promise<void> {
    const index = await this.getProductsIndex();
    await index.deleteDocument(productId);
  }

  /**
   * Delete multiple products from the index
   */
  async deleteProducts(productIds: string[]): Promise<void> {
    if (productIds.length === 0) return;
    const index = await this.getProductsIndex();
    await index.deleteDocuments(productIds);
  }

  /**
   * Delete all products from the index
   */
  async deleteAllProducts(): Promise<void> {
    const index = await this.getProductsIndex();
    await index.deleteAllDocuments();
  }

  /**
   * Search products
   */
  async search(
    query: string,
    options?: SearchParams
  ): Promise<SearchResponse<ProductDocument>> {
    const index = await this.getProductsIndex();
    
    const defaultOptions: SearchParams = {
      limit: 20,
      attributesToHighlight: ["title", "description"],
      ...options,
    };

    return index.search(query, defaultOptions);
  }

  /**
   * Get health/stats of the MeiliSearch instance
   */
  async getHealth(): Promise<{ status: string }> {
    const client = await this.getClient();
    return client.health();
  }

  /**
   * Get stats for the products index
   */
  async getStats(): Promise<{ numberOfDocuments: number; isIndexing: boolean }> {
    const index = await this.getProductsIndex();
    const stats = await index.getStats();
    return {
      numberOfDocuments: stats.numberOfDocuments,
      isIndexing: stats.isIndexing,
    };
  }
}

export type { ProductDocument, SearchParams, SearchResponse };
