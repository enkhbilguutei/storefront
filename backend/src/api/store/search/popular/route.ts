import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

const FALLBACK_TERMS = [
  "iPhone 16",
  "MacBook Pro",
  "Galaxy S24",
  "PlayStation 5",
  "Ray-Ban Meta",
];

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const productService = req.scope.resolve(Modules.PRODUCT);
    const products = await productService.listProducts(
      { status: "published" },
      {
        relations: ["variants", "variants.prices", "collection"],
        take: 8,
        order: { created_at: "DESC" },
      }
    );

    const popularTerms = products.map((p: any) => p.title).filter(Boolean).slice(0, 6);

    const featured = products.map((product: any) => {
      const prices = product.variants?.flatMap((v: any) => v.prices || [])?.map((p: any) => p.amount) || [];
      const minPrice = prices.length ? Math.min(...prices) : null;

      return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        thumbnail: product.thumbnail,
        min_price: minPrice,
        collection_title: product.collection?.title ?? null,
      };
    });

    return res.json({
      terms: popularTerms.length ? popularTerms : FALLBACK_TERMS,
      featured,
    });
  } catch (error) {
    console.error("Failed to fetch popular searches:", error);
    return res.json({ terms: FALLBACK_TERMS, featured: [] });
  }
}
