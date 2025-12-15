import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import MeilisearchService from "../../../../modules/meilisearch/service";
import { MEILISEARCH_MODULE } from "../../../../modules/meilisearch";

interface SuggestionQuery {
  q?: string;
  limit?: string;
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { q = "", limit = "6" } = req.query as SuggestionQuery;
  const trimmed = q.trim();
  const take = Math.min(Math.max(parseInt(limit, 10) || 6, 1), 15);

  if (!trimmed) {
    return res.json({ suggestions: [] });
  }

  try {
    const meilisearchService: MeilisearchService = req.scope.resolve(MEILISEARCH_MODULE);
    await meilisearchService.initializeIndex();

    const results = await meilisearchService.search(trimmed, {
      limit: take,
      attributesToRetrieve: ["title", "handle", "thumbnail", "min_price", "collection_title"],
    });

    const suggestions = results.hits.map((hit) => ({
      title: hit.title,
      handle: hit.handle,
      thumbnail: hit.thumbnail,
      min_price: hit.min_price ?? null,
      collection_title: hit.collection_title ?? null,
    }));

    return res.json({ suggestions, count: suggestions.length });
  } catch (error) {
    console.error("Suggestion search failed, falling back to DB:", error);

    try {
      const productService = req.scope.resolve(Modules.PRODUCT);
      const products = await productService.listProducts(
        { q: trimmed, status: "published" },
        {
          relations: ["variants", "variants.prices", "collection"],
          take,
        }
      );

      const suggestions = products.map((product: any) => {
        const prices = product.variants?.flatMap((v: any) => v.prices || [])?.map((p: any) => p.amount) || [];
        const minPrice = prices.length ? Math.min(...prices) : null;
        return {
          title: product.title,
          handle: product.handle,
          thumbnail: product.thumbnail,
          min_price: minPrice,
          collection_title: product.collection?.title ?? null,
        };
      });

      return res.json({ suggestions, count: suggestions.length, fallback: true });
    } catch (dbError) {
      console.error("DB fallback for suggestions failed:", dbError);
      return res.json({ suggestions: [], count: 0, error: "unavailable" });
    }
  }
}
