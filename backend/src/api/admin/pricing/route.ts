import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type { IPricingModuleService } from "@medusajs/framework/types"

/**
 * GET /admin/pricing
 * 
 * Get all product variants with their current prices
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const productService = req.scope.resolve(Modules.PRODUCT)
    const pricingService: IPricingModuleService = req.scope.resolve(Modules.PRICING)

    // Fetch all products with variants
    const products = await productService.listProducts(
      {},
      {
        relations: ["variants"],
        take: 1000,
      }
    )

    // Get all price sets
    const priceSets = await pricingService.listPriceSets(
      {},
      {
        relations: ["prices", "price_rules"],
      }
    )

    // Build a map of variant_id -> price set with prices
    const variantPriceMap = new Map()
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const priceSet of priceSets as any[]) {
      // Price sets are linked to variants through the variant's price_set_id
      // We need to match them
      if (priceSet.prices && priceSet.prices.length > 0) {
        variantPriceMap.set(priceSet.id, {
          prices: priceSet.prices,
          price_rules: priceSet.price_rules || [],
        })
      }
    }

    // Transform variants with price data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variants = products.flatMap((product: any) =>
      (product.variants || []).map((variant: any) => ({
        id: variant.id,
        title: variant.title || "Default",
        sku: variant.sku,
        product: {
          id: product.id,
          title: product.title,
          thumbnail: product.thumbnail,
        },
        // Prices will be fetched separately through price module
        prices: [],
      }))
    )

    res.json({ 
      variants,
      price_sets: priceSets,
    })
  } catch (error) {
    console.error("Failed to fetch pricing data:", error)
    res.status(500).json({
      message: "Failed to fetch pricing data",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
