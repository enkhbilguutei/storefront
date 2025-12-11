import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import MeilisearchService from "../../../modules/meilisearch/service";
import { MEILISEARCH_MODULE } from "../../../modules/meilisearch";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

interface SearchQuery {
  q?: string;
  limit?: string;
  offset?: string;
  filter?: string;
  sort?: string;
}

// Fallback to database search when Meilisearch is unavailable
async function fallbackDatabaseSearch(
  req: MedusaRequest,
  q: string,
  limit: number,
  offset: number
) {
  const productModuleService = req.scope.resolve(Modules.PRODUCT);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  
  // If no search query, return featured products
  if (!q || q.trim() === "") {
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "description",
        "thumbnail",
        "variants.*",
        "variants.calculated_price.*",
        "images.*",
      ],
      filters: {
        status: "published",
      },
      pagination: {
        take: limit,
        skip: offset,
      },
    });
    
    return {
      hits: products || [],
      query: q,
      processingTimeMs: 0,
      estimatedTotalHits: products?.length || 0,
      limit,
      offset,
      fallback: true,
    };
  }
  
  // Search by title using ILIKE
  try {
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "description",
        "thumbnail",
        "variants.*",
        "variants.calculated_price.*",
        "images.*",
      ],
      filters: {
        status: "published",
        $or: [
          { title: { $ilike: `%${q}%` } },
          { description: { $ilike: `%${q}%` } },
        ],
      },
      pagination: {
        take: limit,
        skip: offset,
      },
    });
    
    return {
      hits: products || [],
      query: q,
      processingTimeMs: 0,
      estimatedTotalHits: products?.length || 0,
      limit,
      offset,
      fallback: true,
    };
  } catch {
    // If $or doesn't work, try simple title search
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "description",
        "thumbnail",
        "variants.*",
        "images.*",
      ],
      filters: {
        status: "published",
      },
      pagination: {
        take: limit,
        skip: offset,
      },
    });
    
    // Filter client-side
    const filtered = (products || []).filter((p) => {
      const title = p.title ?? '';
      const description = p.description ?? '';
      return title.toLowerCase().includes(q.toLowerCase()) ||
        description.toLowerCase().includes(q.toLowerCase());
    });
    
    return {
      hits: filtered,
      query: q,
      processingTimeMs: 0,
      estimatedTotalHits: filtered.length,
      limit,
      offset,
      fallback: true,
    };
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.query as SearchQuery;
  const q = (query.q as string) || "";
  const limit = (query.limit as string) || "12";
  const offset = (query.offset as string) || "0";
  const filter = query.filter as string | undefined;
  const sort = query.sort as string | undefined;

  const limitNum = parseInt(limit, 10);
  const offsetNum = parseInt(offset, 10);

  try {
    const meilisearchService: MeilisearchService = req.scope.resolve(MEILISEARCH_MODULE);

    const searchParams: {
      limit: number;
      offset: number;
      filter?: string;
      sort?: string[];
    } = {
      limit: limitNum,
      offset: offsetNum,
    };

    if (filter) {
      searchParams.filter = filter;
    }

    if (sort) {
      searchParams.sort = [sort];
    }

    const results = await meilisearchService.search(q, searchParams);

    res.json({
      hits: results.hits,
      query: results.query,
      processingTimeMs: results.processingTimeMs,
      estimatedTotalHits: results.estimatedTotalHits,
      limit: results.limit,
      offset: results.offset,
    });
  } catch (error) {
    console.error("Meilisearch error, falling back to database search:", error);
    
    // Fallback to database search
    try {
      const fallbackResults = await fallbackDatabaseSearch(req, q, limitNum, offsetNum);
      res.json(fallbackResults);
    } catch (fallbackError) {
      console.error("Database fallback search error:", fallbackError);
      // Return empty results instead of error to not break the UI
      res.json({
        hits: [],
        query: q,
        processingTimeMs: 0,
        estimatedTotalHits: 0,
        limit: limitNum,
        offset: offsetNum,
        error: "Search temporarily unavailable",
      });
    }
  }
}
