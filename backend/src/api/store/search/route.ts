import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import MeilisearchService from "../../../modules/meilisearch/service";
import { MEILISEARCH_MODULE } from "../../../modules/meilisearch";

interface SearchQuery {
  q?: string;
  limit?: string;
  offset?: string;
  filter?: string;
  sort?: string;
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

  try {
    const meilisearchService: MeilisearchService = req.scope.resolve(MEILISEARCH_MODULE);

    const searchParams: {
      limit: number;
      offset: number;
      filter?: string;
      sort?: string[];
    } = {
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
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
    console.error("Search error:", error);
    res.status(500).json({
      error: "Search service unavailable",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
